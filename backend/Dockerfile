FROM maven:3.9.3-openjdk-17 AS build

WORKDIR /app

RUN microdnf install -y nc curl unzip libaio

COPY pom.xml .
# Install dependencies including python3 and pip for gdown
RUN microdnf install -y libnsl python3 python3-pip curl unzip && \
    pip3 install gdown

# Download Oracle Instant Client zip files from Google Drive using gdown
ENV FILE_ID_BASIC="1c44k0-0bPxSJsX6Iu7zgJXYhZJ3Q-G35"
ENV FILE_ID_SQLPLUS="1rMijC54Zjjr7q7jTENf_FN-La6xxd41i"

RUN gdown --id $FILE_ID_BASIC -O /tmp/instantclient-basic.zip && \
    gdown --id $FILE_ID_SQLPLUS -O /tmp/instantclient-sqlplus.zip && \
    unzip /tmp/instantclient-basic.zip -d /opt/oracle && \
    unzip /tmp/instantclient-sqlplus.zip -d /opt/oracle && \
    rm /tmp/instantclient-basic.zip /tmp/instantclient-sqlplus.zip && \
    ln -s /opt/oracle/instantclient_12_2 /opt/oracle/instantclient && \
    sh -c "echo /opt/oracle/instantclient > /etc/ld.so.conf.d/oracle-instantclient.conf" && \
    ldconfig

COPY src ./src

ENV PATH="/opt/oracle/instantclient:${PATH}"
ENV LD_LIBRARY_PATH="/opt/oracle/instantclient"

RUN mvn dependency:go-offline -B

RUN mvn clean package -DskipTests

FROM openjdk:20-jdk-slim

RUN apt-get update && apt-get install -y netcat && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar
COPY wait-for-oracle.sh wait-for-oracle.sh

RUN chmod +x wait-for-oracle.sh

ENV RETRY_INTERVAL=5
ENV MAX_RETRIES=60

EXPOSE 8080

HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 CMD curl -f http://localhost:8080/actuator/health || exit 1

# Wait for Oracle DB to be ready and reset Oracle password
CMD /bin/sh -c "\
  ./wait-for-oracle.sh && \
  echo \"ALTER USER system IDENTIFIED BY $ORACLE_PASSWORD\" | sqlplus system/$ORACLE_PASSWORD@oracle:1521/XEPDB1 && \
  echo \"set lines 200 pages 1000; select * from core.categories;\" | sqlplus system/$ORACLE_PASSWORD@oracle:1521/XEPDB1 && \
  tail -f /dev/null"

ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=ci"]
