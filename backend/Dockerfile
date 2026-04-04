FROM maven:3.9-eclipse-temurin-17 as build

WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN mvn -B -ntp -Dmaven.repo.local=/root/.m2/repository clean package -DskipTests -Dorg.slf4j.simpleLogger.log.org.apache.maven.cli.transfer.Slf4jMavenTransferListener=warn

FROM eclipse-temurin:17-jdk-slim

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

ENV RETRY_INTERVAL=5
ENV MAX_RETRIES=60

EXPOSE 8080

HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 CMD curl -f http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=ci"]
