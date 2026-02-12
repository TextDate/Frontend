#!/bin/sh
set -e

# Default values for local Docker Compose
BACKEND_URL="${BACKEND_URL:-http://backend:5050}"
PORT="${PORT:-80}"

echo "Configuring nginx with:"
echo "  BACKEND_URL: $BACKEND_URL"
echo "  PORT: $PORT"

# Substitute environment variables in nginx config
envsubst '${BACKEND_URL} ${PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Start nginx
exec nginx -g 'daemon off;'
