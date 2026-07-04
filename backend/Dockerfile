# Build context is the repo ROOT (see docker-compose.yml) so we can copy both
# backend/ and the sibling prisma/ dir (Section 4 puts prisma/ at repo root).
# Multi-stage: install+build, then a lean runtime image.

FROM node:20-alpine AS builder
WORKDIR /app/backend

# Install deps (prisma schema needed before generate, so copy it first).
COPY backend/package*.json ./
COPY prisma ../prisma
RUN npm ci

# Build TypeScript + generate Prisma client.
COPY backend/tsconfig.json ./
COPY backend/src ./src
RUN npm run build

# ---- runtime ----
FROM node:20-alpine AS runner
WORKDIR /app/backend
ENV NODE_ENV=production

# wget is used by the compose healthcheck (alpine ships busybox wget).
COPY backend/package*.json ./
COPY prisma ../prisma
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/backend/node_modules/@prisma ./node_modules/@prisma

EXPOSE 4000
# Run pending migrations, then start (Section 10: backend waits on postgres health).
CMD ["npm", "run", "start:migrate"]
