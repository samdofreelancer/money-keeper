FROM openjdk:18-jdk-slim

WORKDIR /app

COPY target/*.jar app.jar
COPY wait-for-oracle.sh wait-for-oracle.sh

RUN chmod +x wait-for-oracle.sh

EXPOSE 8080

ENTRYPOINT ["./wait-for-oracle.sh", "java", "-jar", "app.jar", "--spring.profiles.active=ci"]
