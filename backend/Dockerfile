# Use Node.js base image with Alpine for lightweight image
FROM node:20-alpine AS base

# Setup pnpm via corepack (faster & lighter than npm install -g pnpm)
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate

# --- BUILD STAGE ---
FROM base AS builder
WORKDIR /app

# Copy configuration files (including .npmrc for only-built-dependencies whitelist)
COPY package.json pnpm-lock.yaml .npmrc* ./

# Install dependencies using BuildKit cache mount for lightning-fast builds
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# Copy the rest of the source code
COPY . .

# Build the application
RUN pnpm run build

# Prune devDependencies to keep only production packages
RUN pnpm prune --prod

# --- PRODUCTION STAGE ---
FROM node:20-alpine AS runner
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Copy pruned production node_modules and built code directly from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./

# Create necessary directories for storage/runtime if needed
RUN mkdir -p uploads database

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "dist/main.js"]

