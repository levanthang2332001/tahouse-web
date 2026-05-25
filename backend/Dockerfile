# Use Node.js base image with Alpine for lightweight image
FROM node:20-alpine AS base

# Install pnpm globally
RUN npm install -g pnpm

# --- BUILD STAGE ---
FROM base AS builder
WORKDIR /app

# Copy configuration files for dependency installation
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (including devDependencies) for building
RUN pnpm install --frozen-lockfile

# Copy the rest of the source code
COPY . .

# Build the application
RUN pnpm run build

# --- PRODUCTION STAGE ---
FROM base AS runner
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Copy package files to install only production dependencies
COPY package.json pnpm-lock.yaml ./

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy compiled application code from the builder stage
COPY --from=builder /app/dist ./dist

# Copy the database files (since application uses JSON database)
COPY --from=builder /app/database ./database

# Create uploads directory for file uploads if needed
RUN mkdir -p uploads

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "dist/main.js"]
