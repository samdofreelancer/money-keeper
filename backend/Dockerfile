FROM maven:3.8.3-openjdk-17 AS build

WORKDIR /app

RUN microdnf install -y nc curl unzip libaio libnsl && \
    microdnf install -y oraclelinux-release-el9 && \
    microdnf install -y oracle-instantclient21.3-basic oracle-instantclient21.3-sqlplus && \
    echo '/usr/lib/oracle/21/client64/lib' > /etc/ld.so.conf.d/oracle-instantclient.conf && \
    ldconfig

COPY pom.xml .
COPY src ./src

ENV PATH="/usr/lib/oracle/21/client64/bin:${PATH}"
ENV LD_LIBRARY_PATH="/usr/lib/oracle/21/client64/lib"

RUN mvn dependency:go-offline -B

RUN mvn -B -ntp -Dmaven.repo.local=/root/.m2/repository clean package -DskipTests -Dorg.slf4j.simpleLogger.log.org.apache.maven.cli.transfer.Slf4jMavenTransferListener=warn

FROM eclipse-temurin:17-jdk-alpine

RUN apk add --no-cache netcat-openbsd curl openssl

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar
COPY wait-for-oracle.sh wait-for-oracle.sh

RUN chmod +x wait-for-oracle.sh

ENV RETRY_INTERVAL=5
ENV MAX_RETRIES=60

EXPOSE 8080

HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 CMD curl -f http://localhost:8080/actuator/health || exit 1

# Wait for Oracle DB to be ready and reset Oracle password
CMD ["/bin/sh", "-c", "./wait-for-oracle.sh && echo \"ALTER USER system IDENTIFIED BY $ORACLE_PASSWORD\" | sqlplus system/$ORACLE_PASSWORD@oracle:1521/XEPDB1 && echo \"set lines 200 pages 1000; select * from core.categories;\" | sqlplus system/$ORACLE_PASSWORD@oracle:1521/XEPDB1 && tail -f /dev/null"]

ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=ci"]
