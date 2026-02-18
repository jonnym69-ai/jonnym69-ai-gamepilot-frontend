FROM node:20

# Set working directory
WORKDIR /workspace

# Enable corepack and activate pnpm
RUN corepack enable
RUN corepack prepare --activate

# Install dependencies
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm pnpm install

# Create non-root user with same UID as host
RUN addgroup --gid 1000 node && \
    adduser --uid 1000 --gid 1000 --shell /bin/bash --create-home node

# Switch to non-root user
USER node

# Expose ports
EXPOSE 5173 3001

# Command to run when container starts
CMD ["sleep", "infinity"]
