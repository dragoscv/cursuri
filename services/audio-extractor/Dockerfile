# syntax=docker/dockerfile:1.7
FROM node:22-slim

# ffmpeg for audio extraction
RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json ./
# No deps to install (zero-dep service), but keep the layer for cache parity.
RUN npm install --omit=dev || true

COPY server.js ./

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["node", "server.js"]
