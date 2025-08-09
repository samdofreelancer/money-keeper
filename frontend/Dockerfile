FROM node:18-alpine

RUN apk add --no-cache curl netcat-openbsd

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npx vite build --mode ci

RUN npm install -g serve

EXPOSE 80

HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 CMD nc -z localhost 80 || exit 1

CMD ["serve", "-s", "dist", "-l", "80"]
