# Extend the official Java 18 dev container image and install Node.js 18
FROM mcr.microsoft.com/vscode/devcontainers/java:18

# Install Node.js 18 (LTS) and npm
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g npm@latest

# Verify installations
RUN java -version && node -v && npm -v
