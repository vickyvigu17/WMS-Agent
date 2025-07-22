#Multi-stage build for WMS Consultant Agent
FROM node:18-alpine AS client-build

# Build the React frontend
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci --only=production
COPY client/ ./
RUN npm run build

# Production image
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app directory
WORKDIR /app

# Copy server package files
COPY server/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy server source code
COPY server/ ./

# Copy built client files
COPY --from=client-build /app/client/build ./public

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S wmsapp -u 1001

# Change ownership of the app directory
RUN chown -R wmsapp:nodejs /app
USER wmsapp

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
