FROM node:18-alpine

RUN apk add --no-cache curl

RUN apt-get update && apt-get install -y netcat curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 CMD nc -z localhost 5173 || exit 1

CMD ["npm", "run", "start", "--", "--host"]
