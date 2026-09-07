FROM node:24-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN npm install --global pnpm@10.28.2

WORKDIR /app


FROM base AS dependencies

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile


FROM dependencies AS development

ENV NODE_ENV=development

COPY . .
COPY entrypoint.sh /usr/local/bin/carona-entrypoint
RUN sed -i 's/\r$//' /usr/local/bin/carona-entrypoint \
  && chmod +x /usr/local/bin/carona-entrypoint

EXPOSE 3000

ENTRYPOINT ["carona-entrypoint"]
CMD ["pnpm", "dev"]


FROM dependencies AS builder

COPY . .
RUN pnpm exec prisma generate \
  && pnpm build \
  && pnpm prune --prod


FROM node:24-alpine AS production

ENV NODE_ENV=production
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 --ingroup nodejs nestjs

COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json

USER nestjs

EXPOSE 3000

CMD ["node", "dist/src/main.js"]
