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
# Keep the heap under the Docker VM's memory limit; a larger value makes Node
# defer GC until the build is OOM-killed ("cannot allocate memory").
ENV NODE_OPTIONS="--max-old-space-size=3072"
ARG GOOGLE_CLIENT_ID
ENV GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
ARG STRIPE_PUBLISHABLE_KEY
ENV STRIPE_PUBLISHABLE_KEY=$STRIPE_PUBLISHABLE_KEY
ARG API_URL
ENV API_URL=$API_URL
# Browser-facing API origin; inlined into the bundle by next.config's env block.
ARG PUBLIC_API_URL
ENV PUBLIC_API_URL=$PUBLIC_API_URL

COPY --from=deps /app ./

# Build @event-space/shared from its own sources first: it costs ~2 min (tsc over
# ~1k generated Zod schemas), so keep it on a layer that app-only edits don't bust.
# The zod generator writes into packages/shared/src/generated, hence both copies.
COPY apps/api/prisma ./apps/api/prisma
COPY packages/shared ./packages/shared
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma
RUN npm run shared:build

COPY . .

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
# Next's standalone server binds to $HOSTNAME, which Docker sets to the container
# id; that address is unreachable from Railway's proxy and answers 502.
ENV HOSTNAME=0.0.0.0
ENV NODE_ENV=production

CMD ["node", "standalone/apps/web/server.js"]