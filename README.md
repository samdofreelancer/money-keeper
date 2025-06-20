# Money Keeper Project

This project consists of three main parts:
- **Frontend**: Vue 3 application using Vite
- **Backend**: Spring Boot application using Java 18 and Maven
- **E2E Tests**: BDD framework using Cucumber and Playwright in TypeScript

## Development Container Setup

A VSCode Dev Container has been configured to provide a consistent development environment for the entire project.

### How to Use the Dev Container

1. Ensure you have [Docker](https://www.docker.com/get-started) and [VSCode](https://code.visualstudio.com/) installed.
2. Install the [Remote - Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension in VSCode.
3. Open this project folder in VSCode.
4. When prompted, reopen the folder in the container. VSCode will build and start the dev container based on the configuration.
5. Inside the container, all dependencies for frontend, backend, and e2e tests will be installed automatically.

### Ports Forwarded

- **5173**: Frontend Vite development server
- **8080**: Backend Spring Boot server

### Running the Project

- **Backend**: Run `mvn spring-boot:run` inside the `backend` folder.
- **Frontend**: Run `npm run dev` inside the `frontend` folder.
- **E2E Tests**: Run `npm test` inside the `e2e` folder.

### Benefits

- Consistent environment across all developers
- No need to install Java, Node.js, Maven, or other dependencies locally
- Easy to start working on any part of the project

---

For more details, refer to the `.devcontainer` folder which contains the Dockerfile and devcontainer.json configuration.

## How to Run the Dev Container

1. Install [Docker](https://www.docker.com/get-started) and [Visual Studio Code](https://code.visualstudio.com/).
2. Install the VSCode extension [Remote - Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers).
3. Open this project folder in VSCode.
4. When prompted, click **Reopen in Container**. If not prompted, open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`) and select **Remote-Containers: Reopen in Container**.
5. VSCode will build and start the dev container. Once ready, you can develop inside the container with all dependencies installed.
6. Use the integrated terminal in VSCode to run backend, frontend, and e2e commands as described above.
