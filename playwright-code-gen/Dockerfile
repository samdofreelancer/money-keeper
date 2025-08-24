FROM mcr.microsoft.com/playwright:v1.55.0-noble

# Install Java
RUN apt-get update && apt-get install -y openjdk-11-jdk && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Set JAVA_HOME
ENV JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64
ENV PATH="${JAVA_HOME}/bin:${PATH}"

# Copy the rest of the application code
COPY . .

# Install dependencies
RUN npm install

# Run lint check
RUN npm run lint

# Set the working directory
WORKDIR /playwright-code-gen

# Default command
CMD ["npm", "run", "test:ci"]
