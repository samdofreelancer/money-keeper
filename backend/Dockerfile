FROM maven:3.8.3-openjdk-17 AS build

WORKDIR /app

RUN microdnf install -y nc curl unzip libaio libnsl

COPY pom.xml .
COPY money-keeper-core/pom.xml money-keeper-core/
COPY tax-service/pom.xml tax-service/
COPY gateway/pom.xml gateway/
COPY eureka-server/pom.xml eureka-server/
COPY src ./src
COPY money-keeper-core/src ./money-keeper-core/src
COPY tax-service/src ./tax-service/src
COPY gateway/src ./gateway/src
COPY eureka-server/src ./eureka-server/src

RUN mvn dependency:go-offline -B

RUN mvn -B -ntp -Dmaven.repo.local=/root/.m2/repository clean package -DskipTests -Dorg.slf4j.simpleLogger.log.org.apache.maven.cli.transfer.Slf4jMavenTransferListener=warn

FROM eclipse-temurin:17-jdk-alpine

RUN apk add --no-cache netcat-openbsd curl openssl

WORKDIR /app

COPY --from=build /app/money-keeper-core/target/*.jar app.jar

ENV RETRY_INTERVAL=5
ENV MAX_RETRIES=60

EXPOSE 8080

HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 CMD curl -f http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=ci"]
