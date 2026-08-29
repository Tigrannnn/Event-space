# ---- Stage 1: All deps (for building) ----
FROM node:22-alpine AS deps
WORKDIR /app

COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/shared/package*.json ./packages/shared/

RUN npm install

# ---- Stage 2: Builder ----
FROM node:22-alpine AS builder
WORKDIR /app

ENV NODE_ENV=production
# Keep the heap under the Docker VM's memory limit; a larger value makes Node
# defer GC until the build is OOM-killed ("cannot allocate memory").
ENV NODE_OPTIONS="--max-old-space-size=3072"

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate --schema=apps/api/prisma/schema.prisma
RUN npm run shared:build
RUN npm run api:build

# ---- Stage 3: Production runner ----
FROM node:22-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/apps/api/prisma ./prisma

RUN chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 5000

# Apply pending migrations before booting: the managed database starts empty and
# there is no separate release step on Railway.
CMD ["sh", "-c", "npx prisma migrate deploy --schema=./prisma/schema.prisma && node dist/src/main.js"]