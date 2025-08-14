# ---------- Build stage (nhẹ, Alpine) ----------
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /app

# cache deps
COPY pom.xml .
RUN mvn -q -B -DskipTests dependency:go-offline

# build
COPY src ./src
RUN mvn -q -B -DskipTests clean package

# ---------- Runtime stage ----------
FROM eclipse-temurin:21-jre-alpine

# tiny tools cho healthcheck/wait
RUN apk add --no-cache curl bash

WORKDIR /app
# copy fat jar
COPY --from=build /app/target/*.jar app.jar

# script chờ Oracle sẵn sàng (không cần sqlplus/instantclient)
# chỉ "telnet" cổng 1521 và thử JDBC một vài lần
COPY <<'BASH' /app/entrypoint.sh
#!/usr/bin/env bash
set -euo pipefail

RETRY_INTERVAL="${RETRY_INTERVAL:-5}"
MAX_RETRIES="${MAX_RETRIES:-60}"

HOST="${ORACLE_HOST:-oracle}"
PORT="${ORACLE_PORT:-1521}"

echo "Waiting for Oracle at ${HOST}:${PORT} ..."
for ((i=1;i<=MAX_RETRIES;i++)); do
  if timeout 2 bash -c "cat < /dev/null > /dev/tcp/${HOST}/${PORT}" 2>/dev/null; then
    echo "Oracle TCP open."
    break
  fi
  echo "not ready (${i}/${MAX_RETRIES})"; sleep "${RETRY_INTERVAL}"
done

# Optional: thêm 1 chút delay cho PDB open
sleep 5

# chạy app
exec java ${JAVA_OPTS:-"-XX:+UseContainerSupport -Xms128m -Xmx512m"} -jar app.jar --spring.profiles.active=${SPRING_PROFILE:-ci}
BASH
RUN chmod +x /app/entrypoint.sh

ENV RETRY_INTERVAL=5 \
    MAX_RETRIES=60

EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -fsS http://localhost:8080/actuator/health | grep -q '"status":"UP"' || exit 1

ENTRYPOINT ["/app/entrypoint.sh"]
