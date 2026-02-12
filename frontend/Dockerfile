# Build stage
FROM node:23.9.0-alpine AS builder

# Build arguments with defaults (can be overridden in Railway)
ARG VITE_API_URL=/api/
ARG VITE_API_TIMEOUT=100000
ARG VITE_API_MAX_FILE_SIZE=5242880

# Convert ARGs to ENVs for Vite build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_API_TIMEOUT=$VITE_API_TIMEOUT
ENV VITE_API_MAX_FILE_SIZE=$VITE_API_MAX_FILE_SIZE

WORKDIR /app

COPY package*.json ./
RUN npm install

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