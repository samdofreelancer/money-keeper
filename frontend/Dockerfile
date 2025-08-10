FROM node:18-alpine

RUN apk add --no-cache curl netcat-openbsd
WORKDIR /app

COPY package*.json ./
RUN npm ci

# nhận biến build-time cho Vite
ARG VITE_API_URL=/api
ARG VITE_APP_TITLE="Money Keeper"
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_APP_TITLE=${VITE_APP_TITLE}

COPY . .
RUN npx vite build --mode production

RUN npm install -g serve
EXPOSE 80
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 CMD nc -z localhost 80 || exit 1
CMD ["serve", "-s", "dist", "-l", "80"]
