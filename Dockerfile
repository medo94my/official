# Use specific Bun version
FROM oven/bun:latest

WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install

# Copy source code
COPY . .

# Expose Vite port
EXPOSE 5173

# Start development server
CMD ["bun", "run", "dev", "--host"]
