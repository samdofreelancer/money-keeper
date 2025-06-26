FROM openjdk:18-jdk-slim

RUN apt-get update && apt-get install -y netcat curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY target/*.jar app.jar
COPY wait-for-oracle.sh wait-for-oracle.sh

RUN chmod +x wait-for-oracle.sh

EXPOSE 8080

HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 CMD curl -f http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["./wait-for-oracle.sh", "java", "-jar", "app.jar", "--spring.profiles.active=ci"]
