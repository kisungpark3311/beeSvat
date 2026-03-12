# Stage 1: Dependencies
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --ignore-scripts
COPY prisma ./prisma/
RUN npx prisma generate

# Stage 2: Build
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# Prisma 런타임에 필요한 모든 의존성을 별도 디렉토리로 수집
RUN mkdir -p /prisma-deps && \
    node -e " \
    function getDeps(pkg, seen) { \
      if (seen.has(pkg)) return; \
      seen.add(pkg); \
      try { \
        const p = require('./node_modules/' + pkg + '/package.json'); \
        for (const d of Object.keys(p.dependencies || {})) getDeps(d, seen); \
      } catch(e) {} \
    } \
    const all = new Set(); \
    ['prisma','@prisma/config','@prisma/client'].forEach(p => getDeps(p, all)); \
    console.log([...all].join('\n')); \
    " | while read pkg; do \
      if [ -d "node_modules/$pkg" ]; then \
        mkdir -p "/prisma-deps/node_modules/$(dirname $pkg)" && \
        cp -r "node_modules/$pkg" "/prisma-deps/node_modules/$pkg"; \
      fi; \
    done && \
    cp -r node_modules/.prisma /prisma-deps/node_modules/.prisma

# Stage 3: Production
FROM node:22-alpine AS runner
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
# Prisma 런타임 의존성 전체 (자동 수집)
COPY --from=builder /prisma-deps/node_modules ./node_modules

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["sh", "-c", "node node_modules/prisma/build/index.js migrate deploy && node server.js"]
