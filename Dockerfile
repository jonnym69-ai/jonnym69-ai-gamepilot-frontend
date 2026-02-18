FROM node:18-alpine

WORKDIR /app

# Copy workspace configuration
COPY package*.json ./
COPY tsconfig*.json ./
COPY packages ./packages
COPY apps ./apps

# Install dependencies for all workspaces
RUN npm install

# Build all packages first
RUN npm run build:packages

# Build the API specifically
RUN npm run build:api

# Copy built API to working directory
RUN cp -r apps/api/dist ./dist

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "dist/index.js"]
