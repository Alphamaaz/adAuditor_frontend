FROM node:20-slim AS builder
WORKDIR /app

COPY package*.json ./
# Cache mount keeps downloaded packages between builds — no re-download on package.json changes
RUN --mount=type=cache,target=/root/.npm \
    npm ci

COPY . .

ENV NEXT_PUBLIC_API_URL=https://api.adadviser.uk
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Standalone runner — no node_modules needed, image is ~90% smaller
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
