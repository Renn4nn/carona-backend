#!/bin/sh
set -eu

echo "Generating Prisma Client..."
pnpm exec prisma generate

echo "Applying database migrations..."
pnpm exec prisma migrate deploy

echo "Starting backend..."
exec "$@"
