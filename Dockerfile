# Multi-stage Dockerfile for ChatPulse (Node.js + WebRTC WebSocket Server)
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci || npm install --legacy-peer-deps

COPY . .
RUN npm run build

# Production runtime stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev --legacy-peer-deps

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/src ./src

# Install tsx globally for fast typescript execution in production
RUN npm install -g tsx

EXPOSE 3000

CMD ["tsx", "server.ts"]
