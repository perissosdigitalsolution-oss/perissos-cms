#!/bin/sh
# apps/backoffice/scripts/docker-entrypoint.sh
# Entrypoint script for backoffice container

set -e

echo "🐳 Starting Perissos Backoffice..."

# If DATABASE_URL is set (Railway/Neon/cloud), skip local Docker dependency checks
if [ -n "$DATABASE_URL" ]; then
  echo "☁️  Cloud mode: DATABASE_URL detected, skipping local Docker checks"
else
  # Wait for local PostgreSQL to be ready
  echo "⏳ Waiting for PostgreSQL..."
  while ! pg_isready -h ${POSTGRES_HOST:-postgres} -p ${POSTGRES_PORT:-5432} -U ${POSTGRES_USER:-perissos} -d ${POSTGRES_DB:-perissos_dev} > /dev/null 2>&1; do
    echo "   Waiting for database..."
    sleep 2
  done
  echo "✅ Database is ready!"

  # Wait for local MinIO to be ready
  echo "⏳ Waiting for MinIO..."
  while ! curl -f http://${MINIO_HOST:-minio}:9000/minio/health/live > /dev/null 2>&1; do
    echo "   Waiting for MinIO..."
    sleep 2
  done
  echo "✅ MinIO is ready!"
fi

# Generate Payload secret if not set
if [ -z "$PAYLOAD_SECRET" ]; then
  export PAYLOAD_SECRET=$(openssl rand -hex 32)
  echo "🔐 Generated PAYLOAD_SECRET"
fi

# Run database migrations/push (schema push is handled by postgresAdapter push:true at startup)

echo "🚀 Starting Next.js server..."
exec "$@"
