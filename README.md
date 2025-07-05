# Money Keeper Project

This project consists of three main parts:
- **Frontend**: Vue 3 application using Vite
- **Backend**: Spring Boot application using Java 18 and Maven
- **E2E Tests**: BDD framework using Cucumber and Playwright in TypeScript

## Development Container Setup and Usage

A VSCode Dev Container has been configured to provide a consistent development environment for the entire project.

### Setup and Usage

1. Ensure you have [Docker](https://www.docker.com/get-started) and [Visual Studio Code](https://code.visualstudio.com/) installed.
2. Install the [Remote - Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension in VSCode.
3. Open this project folder in VSCode.
4. When prompted, click **Reopen in Container**. If not prompted, open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`) and select **Remote-Containers: Reopen in Container**.
5. VSCode will build and start the dev container based on the configuration.
6. Inside the container, all dependencies for frontend, backend, and e2e tests will be installed automatically.
7. Use the integrated terminal in VSCode to run backend, frontend, and e2e commands as described below.

### Ports Forwarded

- **5173**: Frontend Vite development server
- **8080**: Backend Spring Boot server
- **1522**: Oracle DB host port mapped to container port 1521 (used for local development)

## Running the Database and Migrations

### Using Docker Compose

The project uses Docker Compose to run the Oracle database and Flyway for database migrations.

1. Start the Oracle database and Flyway migration service:

```bash
docker-compose up -d oracle flyway
```

2. The Oracle database listens on port 1521 inside the container, mapped to port 1522 on the host.

3. Flyway will run migrations located in `backend/src/main/resources/db/migration/oracle` against the Oracle database.

4. The Oracle user `CORE` is created with a default password `core_password` for local and CI environments only. **Do not use this password in production.**

### Running Locally with H2 Database

For local development without Oracle, the application uses an in-memory H2 database.

- The H2 database is configured in `backend/src/main/resources/application-local.properties`.
- Flyway migrations for H2 are located in `backend/src/main/resources/db/migration/h2`.
- To run the application with H2, use the `local` Spring profile.

### Running in CI

- The CI environment uses Oracle with connection details configured in `backend/src/main/resources/application-ci.properties`.
- The Oracle password is injected via the `ORACLE_PASSWORD` environment variable.
- Flyway migrations are disabled in CI by default (`spring.flyway.enabled=false`), assuming migrations are run separately via Flyway container in Docker Compose.

## Consistency Notes

- Ports:
  - Oracle container listens on 1521 internally.
  - Host port 1522 is mapped to Oracle container port 1521 in Docker Compose.
  - Application connection strings use port 1521 to connect inside the Docker network.
- Schema names:
  - The default schema used is `CORE` for both H2 and Oracle.
- Migration versioning:
  - Migration version numbers are consistent and monotonic between H2 and Oracle.
  - Oracle has an additional `V0__create_core_user.sql` migration for user creation.
  - No migration version 3 exists in either H2 or Oracle migrations.

## Testing Both Setups Locally

- To test with H2:
  - Use the `local` Spring profile.
  - Run the application normally; it will use the in-memory H2 database.
- To test with Oracle:
  - Ensure Docker Compose is running Oracle on port 1522.
  - Set the `ORACLE_PASSWORD` environment variable.
  - Use the `ci` Spring profile or configure accordingly.
  - Run the application; it will connect to Oracle and run migrations.

## Important Security Note

- The Oracle user creation script uses a hardcoded password `core_password` for local and CI environments only.
- **Do not use this password in production environments.**
- For production, use secure password management and secrets handling.

## Additional Recommendations

- Double-check all ports and connection strings in your environment to ensure consistency, especially if you modify Docker Compose or application properties.
- Verify migration version numbers remain consistent and monotonic between H2 and Oracle to avoid migration conflicts.
- Always test both H2 and Oracle setups locally after changes to migrations or configuration.
- Avoid using hardcoded passwords in production; use environment variables or secret management solutions.

---

For more details, refer to the `backend/README.md` and the Docker Compose configuration.
