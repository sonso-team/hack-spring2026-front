FROM node:22-alpine
WORKDIR /app

COPY package.json package-lock.json* ./

RUN set -eux; \
  npm ci;

COPY . .

EXPOSE 5001
CMD ["sh", "-lc", "npm run dev -- --host 0.0.0.0 --port 5173"]
