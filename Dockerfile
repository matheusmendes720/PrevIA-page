# frontend/Dockerfile
# Multi-stage build supporting production, testing, and active testing builds

# Base stage with all dependencies
FROM node:18-alpine AS base

WORKDIR /app

# Install system dependencies for testing
RUN apk add --no-cache bash

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for testing)
RUN npm ci

# Copy source code
COPY . .

# Testing stage - keeps active for continuous testing
FROM base AS testing

WORKDIR /app

# Expose port for dev server
EXPOSE 3003

# Health check for testing builds (only active in dev/test mode)
# Note: Health check is optional and can be disabled if not needed
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "const http = require('http'); http.get('http://localhost:3003', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)}).on('error', () => process.exit(1))" || exit 1

# Default: Run tests in watch mode (keeps container active)
# Override with: docker run ... --env TEST_MODE=5g
# Available modes: watch, 5g, 5g:watch, validation, all
CMD ["sh", "-c", "if [ \"$TEST_MODE\" = \"5g\" ]; then npm run test:5g; elif [ \"$TEST_MODE\" = \"5g:watch\" ]; then npm run test:5g:watch; elif [ \"$TEST_MODE\" = \"validation\" ]; then npm run test:validation; elif [ \"$TEST_MODE\" = \"dev\" ]; then npm run dev; else npm run test:watch; fi"]

# Builder stage for production builds
FROM base AS builder

WORKDIR /app

# Build the Next.js application
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Install serve to run the application
RUN npm install -g serve

# Copy the build output from the previous stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

# Expose port
EXPOSE 3000

# Run the application
CMD ["serve", "-s", ".next", "-l", "3000"]