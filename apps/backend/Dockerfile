FROM node:20-alpine AS builder

WORKDIR /app

# Copy root files
COPY package*.json ./
COPY tsconfig*.json ./

# Copy source
COPY packages ./packages
COPY apps/backend ./apps/backend

# Install and build
RUN npm ci
RUN npm run build -w packages/shared
RUN npx prisma generate --schema=apps/backend/prisma/schema.prisma
RUN npm run build -w apps/backend

# Production stage
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/package.json ./apps/backend/package.json
COPY --from=builder /app/apps/backend/prisma ./apps/backend/prisma

ENV DATABASE_URL="file:./dev.db"

EXPOSE 3000

# We need to run migrations so DB exists
CMD ["sh", "-c", "npx prisma migrate deploy --schema=apps/backend/prisma/schema.prisma && node apps/backend/dist/main"]
