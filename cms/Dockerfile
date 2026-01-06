FROM node:20-alpine

# Set working directory
WORKDIR /opt/app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Set build arguments and environment variables
ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV:-production}

ARG ADMIN_JWT_SECRET
ENV ADMIN_JWT_SECRET=${ADMIN_JWT_SECRET}

ARG APP_KEYS
ENV APP_KEYS=${APP_KEYS}

ARG API_TOKEN_SALT
ENV API_TOKEN_SALT=${API_TOKEN_SALT}

ARG TRANSFER_TOKEN_SALT
ENV TRANSFER_TOKEN_SALT=${TRANSFER_TOKEN_SALT}

ARG DATABASE_CLIENT
ENV DATABASE_CLIENT=${DATABASE_CLIENT}

ARG DATABASE_FILENAME
ENV DATABASE_FILENAME=${DATABASE_FILENAME}

ARG JWT_SECRET
ENV JWT_SECRET=${JWT_SECRET}

# Build admin panel
RUN npm run build

# Expose Strapi port
EXPOSE 1337

# Start Strapi in development mode
CMD ["npm", "run", "develop"]
