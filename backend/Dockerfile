FROM maven:3.8.6-openjdk-18 as build

WORKDIR /app

RUN microdnf install -y nc curl unzip libaio

COPY pom.xml .
COPY src ./src

# Copy Oracle Instant Client zip files from deployment/images folder
COPY deployment/images/instantclient-basic-linux.x64-12.2.0.1.0.zip /tmp/instantclient-basic.zip
COPY deployment/images/instantclient-sqlplus-linux.x64-12.2.0.1.0.zip /tmp/instantclient-sqlplus.zip

# Install Oracle Instant Client Basic and SQL*Plus and dependencies
RUN microdnf install -y libnsl && \
    unzip /tmp/instantclient-basic.zip -d /opt/oracle && \
    unzip /tmp/instantclient-sqlplus.zip -d /opt/oracle && \
    rm /tmp/instantclient-basic.zip /tmp/instantclient-sqlplus.zip && \
    ln -s /opt/oracle/instantclient_12_2 /opt/oracle/instantclient && \
    sh -c "echo /opt/oracle/instantclient > /etc/ld.so.conf.d/oracle-instantclient.conf" && \
    ldconfig

ENV PATH="/opt/oracle/instantclient:${PATH}"
ENV LD_LIBRARY_PATH="/opt/oracle/instantclient"

RUN mvn clean package -DskipTests

FROM openjdk:18-jdk-slim

RUN apt-get update && apt-get install -y netcat curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar
COPY wait-for-oracle.sh wait-for-oracle.sh

RUN chmod +x wait-for-oracle.sh

EXPOSE 8080

HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 CMD curl -f http://localhost:8080/actuator/health || exit 1

# Wait for Oracle DB to be ready and reset Oracle password
CMD /bin/sh -c "\
  until nc -z oracle 1521; do \
    echo 'Waiting for Oracle DB...'; \
    sleep 5; \
  done; \
  echo \"ALTER USER system IDENTIFIED BY $ORACLE_PASSWORD\" | sqlplus system/$ORACLE_PASSWORD@oracle:1521/XEPDB1 && \
  echo \"set lines 200 pages 1000; select * from core.categories;\" | sqlplus system/$ORACLE_PASSWORD@oracle:1521/XEPDB1 && \
  tail -f /dev/null"

ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=ci"]
