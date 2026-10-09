# ==========================================================
# Melodium SJEC — Multi-Stage Production Dockerfile
# Optimized for Raspberry Pi (ARM64/ARMv7) & Standard Linux VPS
# ==========================================================

# --- Stage 1: Build Frontend (Vite) ---
FROM node:20-alpine AS client-builder
WORKDIR /app/client

# Install build dependencies
COPY client/package*.json ./
RUN npm ci

# Pass build-time environment variables for Vite bundle
ARG VITE_RAZORPAY_KEY_ID
ARG VITE_API_URL
ENV VITE_RAZORPAY_KEY_ID=$VITE_RAZORPAY_KEY_ID
ENV VITE_API_URL=$VITE_API_URL

# Copy source and build static bundle
COPY client/ ./
RUN npm run build

# --- Stage 2: Production Server & Static Host ---
FROM node:20-alpine AS runner
WORKDIR /app

# Create server directory and install production dependencies only
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev && npm cache clean --force

# Copy backend source
COPY server/ ./server/

# Copy built frontend assets to backend public directory
COPY --from=client-builder /app/client/dist ./server/public

# Set production environment defaults
ENV NODE_ENV=production
ENV PORT=5000

# Expose Web & API Port
EXPOSE 5000

# Docker Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => { if (r.statusCode !== 200) process.exit(1); })"

# Start the Melodium SJEC server
CMD ["node", "server/index.js"]
