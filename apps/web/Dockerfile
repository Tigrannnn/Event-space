# ---- Stage 1: All deps (for building) ----
FROM node:22-alpine AS deps
WORKDIR /app

COPY package*.json ./
COPY apps/web/package*.json ./apps/web/
COPY apps/api/package*.json ./apps/api/
COPY packages/shared/package*.json ./packages/shared/

RUN npm install

# ---- Stage 2: Builder ----
FROM node:22-alpine AS builder
WORKDIR /app

ENV NODE_ENV=production
ARG GOOGLE_CLIENT_ID
ENV GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID

COPY --from=deps /app ./
COPY . .

RUN npx prisma generate --schema=apps/api/prisma/schema.prisma
RUN npm run shared:build
RUN npm run web:build

# ---- Stage 3: Runner ----
FROM node:22-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/.next/standalone ./standalone
COPY --from=builder /app/apps/web/.next/static ./standalone/apps/web/.next/static
COPY --from=builder /app/apps/web/public ./standalone/apps/web/public

RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV NODE_ENV=production

CMD ["node", "standalone/apps/web/server.js"]