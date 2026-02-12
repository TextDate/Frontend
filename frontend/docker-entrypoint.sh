#!/bin/sh
set -e

# Default backend URL for local Docker Compose
BACKEND_URL="${BACKEND_URL:-http://backend:5050}"

echo "Configuring nginx with BACKEND_URL: $BACKEND_URL"

# Substitute environment variable in nginx config
envsubst '${BACKEND_URL}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Start nginx
exec nginx -g 'daemon off;'
