FROM maven:3.8.3-openjdk-17 AS build

WORKDIR /app

RUN microdnf install -y nc curl unzip libaio libnsl

# Copy parent pom and all modules
COPY pom.xml .
COPY eureka-server/pom.xml ./eureka-server/
COPY gateway/pom.xml ./gateway/
COPY money-keeper-core/pom.xml ./money-keeper-core/
COPY tax-service/pom.xml ./tax-service/
COPY tax-service/src ./tax-service/src

RUN mvn dependency:go-offline -B

RUN mvn clean package -DskipTests -Dorg.slf4j.simpleLogger.log.org.apache.maven.cli.transfer.Slf4jMavenTransferListener=warn -pl tax-service

FROM eclipse-temurin:17-jdk-alpine

RUN apk add --no-cache netcat-openbsd curl openssl

WORKDIR /app

COPY --from=build /app/tax-service/target/*.jar app.jar

ENV RETRY_INTERVAL=5
ENV MAX_RETRIES=60

EXPOSE 8082

HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 CMD curl -f http://localhost:8082/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
