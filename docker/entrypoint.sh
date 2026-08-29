#!/bin/sh
set -e

echo "[entrypoint] applying the Prisma schema to ${DATABASE_URL}"
./node_modules/.bin/prisma db push --skip-generate

echo "[entrypoint] seeding the database"
node dist/database/seed.js

echo "[entrypoint] starting the API"
exec node dist/main.js
