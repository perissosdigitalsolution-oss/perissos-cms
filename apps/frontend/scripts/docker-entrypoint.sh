#!/bin/sh
# apps/frontend/scripts/docker-entrypoint.sh
# Entrypoint script for frontend container

set -e

echo "🐳 Starting Perissos Frontend..."

# Wait for backoffice to be ready
echo "⏳ Waiting for Backoffice API..."
while ! curl -f http://backoffice:3000/api/health > /dev/null 2>&1; do
  echo "   Waiting for Backoffice..."
  sleep 2
done
echo "✅ Backoffice API is ready!"

echo "🚀 Starting Nginx..."
exec "$@"
