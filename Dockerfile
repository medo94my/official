# syntax=docker/dockerfile:1

# ---- deps ----------------------------------------------------------------
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
COPY prisma ./prisma
# `npm ci` runs the postinstall `prisma generate`, which needs the schema —
# hence copying prisma/ before installing.
RUN npm ci

# ---- builder -------------------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* is inlined into the client bundle at build time, so these have
# to be present here rather than at runtime.
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_WHATSAPP_NUMBER
ARG NEXT_PUBLIC_EMAILJS_SERVICE_ID
ARG NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
ARG NEXT_PUBLIC_EMAILJS_IDEA_TEMPLATE_ID
ARG NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_WHATSAPP_NUMBER=$NEXT_PUBLIC_WHATSAPP_NUMBER \
    NEXT_PUBLIC_EMAILJS_SERVICE_ID=$NEXT_PUBLIC_EMAILJS_SERVICE_ID \
    NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=$NEXT_PUBLIC_EMAILJS_TEMPLATE_ID \
    NEXT_PUBLIC_EMAILJS_IDEA_TEMPLATE_ID=$NEXT_PUBLIC_EMAILJS_IDEA_TEMPLATE_ID \
    NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=$NEXT_PUBLIC_EMAILJS_PUBLIC_KEY \
    NEXT_TELEMETRY_DISABLED=1

RUN npx prisma generate && npm run build

# ---- runner --------------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1

# Prisma's query engine links against OpenSSL; without it the CLI falls back to
# a wrong build and fails at start.
RUN apk add --no-cache libc6-compat openssl

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# `output: 'standalone'` in next.config.js emits a self-contained server with
# only the modules it actually uses.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Needed at container start to apply migrations and (optionally) seed. The
# standalone bundle does not include the CLI or the seed's dependencies.
# --chown throughout: the Prisma CLI writes into its own package directory on
# start, so these cannot be left owned by root.
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/lib/migrate-old-data.ts ./lib/migrate-old-data.ts
COPY --from=builder --chown=nextjs:nodejs /app/lib/prisma.ts ./lib/prisma.ts
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.bin ./node_modules/.bin
# tsx + its esbuild backend run the TypeScript seed. Copied explicitly so
# SEED_ON_START never has to reach the network to fetch them.
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/tsx ./node_modules/tsx
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/esbuild ./node_modules/esbuild
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@esbuild ./node_modules/@esbuild
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/bcryptjs ./node_modules/bcryptjs
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/get-tsconfig ./node_modules/get-tsconfig
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/resolve-pkg-maps ./node_modules/resolve-pkg-maps

COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

USER nextjs
EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "server.js"]
