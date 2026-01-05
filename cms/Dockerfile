FROM node:20-alpine

# Set working directory
WORKDIR /opt/app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build admin panel (optional for dev, but good practice)
RUN npm run build

# Expose Strapi port
EXPOSE 1337

# Start Strapi in development mode
CMD ["npm", "run", "develop"]
