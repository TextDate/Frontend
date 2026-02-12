# Build stage
FROM node:23.9.0-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Install envsubst for environment variable substitution
RUN apk add --no-cache gettext

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config template (uses BACKEND_URL env var)
COPY nginx.conf.template /etc/nginx/conf.d/default.conf.template
# Also copy original for local docker-compose compatibility
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy and setup entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

# Use entrypoint that substitutes env vars before starting nginx
ENTRYPOINT ["/docker-entrypoint.sh"]