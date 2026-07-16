# Getting Started with Money Keeper

> **Prerequisites, environment setup, and first run guide**

---

## 📋 Prerequisites

### Required Software
| Tool | Version | Purpose |
|------|---------|---------|
| [Java JDK](https://adoptium.net/) | 17+ | Backend runtime |
| [Node.js](https://nodejs.org/) | 18+ | Frontend + E2E tests |
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | Latest | Oracle DB, containerization |
| [Git](https://git-scm.com/) | Latest | Version control |
| [VSCode](https://code.visualstudio.com/) | Latest | Recommended IDE |

### Optional but Recommended
| Tool | Purpose |
|------|---------|
| [Postman](https://www.postman.com/) | API testing |
| [ngrok](https://ngrok.com/) | Local tunnel for CI testing |
| [kubectl](https://kubernetes.io/docs/tasks/tools/) | Kubernetes management |
| [Helm](https://helm.sh/) | K8s package management |
| [gcloud CLI](https://cloud.google.com/sdk) | GCP interaction |

---

## 🔧 Environment Setup

### 1. Clone the Repository
```bash
git clone https://github.com/samdofreelancer/money-keeper.git
cd money-keeper
```

### 2. Backend Setup (Spring Boot)
```bash
# Navigate to backend
cd backend

# Build the project (skip tests for first build)
mvn clean install -DskipTests

# Run unit tests only
mvn test -P unit-test

# Run integration tests (requires Docker for Oracle)
mvn test -P integration-test
```

### 3. Frontend Setup (Vue 3)
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
Frontend will be available at `http://localhost:5173`

### 4. Database Setup (Docker Compose)
```bash
# Start Oracle database and Flyway migrations
docker-compose up -d oracle flyway

# Verify Oracle is ready
docker logs money-keeper-oracle -f
```

### 5. E2E Test Setup (Playwright + Cucumber)
```bash
# Navigate to e2e directory
cd e2e

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Run tests (requires backend + frontend running)
npm test
```

---

## 🚀 Quick Start (Full Stack)

### Option A: Automated Scripts
```bash
# Start everything and run tests
bash start_all.sh
```

### Option B: Manual Step-by-Step

**Terminal 1 — Start Backend:**
```bash
# Start Oracle + Flyway
docker-compose up -d oracle flyway

# Set Oracle password
export ORACLE_PASSWORD=core_password

# Start Spring Boot
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=ci
```
Backend: `http://localhost:8080`

**Terminal 2 — Start Frontend:**
```bash
cd frontend
npm install
npm run dev
```
Frontend: `http://localhost:5173`

**Terminal 3 — Run E2E Tests:**
```bash
cd e2e
npm install
npx playwright install
npm test
```

---

## 🐳 VSCode Dev Container

The project includes a pre-configured Dev Container for a consistent environment.

```bash
# In VSCode:
1. Install "Remote - Containers" extension
2. Ctrl+Shift+P → "Reopen in Container"
3. Wait for build to complete
4. All dependencies installed automatically
```

**Forwarded Ports:**
| Port | Service |
|------|---------|
| 5173 | Frontend (Vite) |
| 8080 | Backend (Spring Boot) |
| 1522 | Oracle DB (mapped from 1521) |

---

## 🗄️ Database Options

### Local Development (H2 — Fast)
- Default profile: `local`
- In-memory database, no setup needed
- Migrations: `backend/src/main/resources/db/migration/h2/`
- Run: `mvn spring-boot:run -Dspring-boot.run.profiles=local`

### CI/Oracle (Production-like)
- Profile: `ci`
- Requires Docker for Oracle container
- Migrations: `backend/src/main/resources/db/migration/oracle/`
- Run: `docker-compose up -d oracle flyway` then `mvn spring-boot:run -Dspring-boot.run.profiles=ci`

---

## 📁 Key Files

### Configuration Files
| File | Purpose |
|------|---------|
| `backend/src/main/resources/application.properties` | Default config |
| `backend/src/main/resources/application-local.properties` | H2 profile |
| `backend/src/main/resources/application-ci.properties` | Oracle/CI profile |
| `frontend/.env.development` | Frontend dev env vars |
| `frontend/.env.ci` | Frontend CI env vars |
| `docker-compose.yml` | Local dev stack |

### Build/Deploy Files
| File | Purpose |
|------|---------|
| `backend/pom.xml` | Maven project config |
| `frontend/package.json` | Frontend dependencies |
| `frontend/vite.config.ts` | Vite build config |
| `k8s/Chart.yaml` | Helm chart |
| `e2e/playwright.config.ts` | Playwright config |

---

## 🧪 Running Tests

```bash
# Backend Unit Tests
cd backend && mvn test -P unit-test

# Backend Integration Tests (needs Docker)
cd backend && mvn test -P integration-test

# Frontend Lint
cd frontend && npm run lint

# E2E Tests (needs backend + frontend running)
cd e2e && npm test

# All Backend Tests
cd backend && mvn verify
```

---

## 🚢 CI/CD Pipeline

The project uses GitHub Actions for CI/CD:

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `ci.yml` | Push/PR to develop/master | Unit + Integration + Code Analysis + E2E |
| `e2e-gke.yml` | Manual | Full E2E with GKE deployment |
| `build-images.yml` | Called | Build Docker images |
| `deploy-backend.yml` | Called | Deploy backend with ngrok |
| `deploy-frontend.yml` | Called | Deploy frontend to GKE |

> **Note**: CI requires repository secrets (`ORACLE_PASSWORD_SECRET`, `SONAR_TOKEN`, etc.)

---

## 🐛 Troubleshooting

### Common Issues

**Issue: Oracle container won't start**
```bash
# Check if port 1522 is in use
netstat -ano | findstr :1522
# Or on Linux/Mac:
lsof -i :1522
```

**Issue: Backend can't connect to Oracle**
```bash
# Verify Oracle is running
docker ps | findstr oracle

# Check connection details in application-ci.properties
```

**Issue: Frontend can't reach backend (CORS)**
- Verify backend is running on port 8080
- Check `VITE_API_BASE_URL` in `.env.development`

**Issue: E2E tests failing**
```bash
# Check if backend + frontend are running
curl http://localhost:8080/actuator/health
curl http://localhost:5173

# Install Playwright browsers
npx playwright install --with-deps
```

### Port Reference
| Port | Service | Note |
|------|---------|------|
| 5173 | Frontend (Vite) | Local dev |
| 8080 | Backend | Spring Boot |
| 1521 | Oracle (internal) | Docker network |
| 1522 | Oracle (host) | Mapped from 1521 |

---

## 📚 Next Steps

After getting the app running:

1. **Read the [Architecture](architecture.md)** — Understand system design
2. **Read the [Development Guide](DEVELOPMENT_GUIDE.md)** — Learn coding conventions
3. **Read the [Testing Strategy](TESTING_STRATEGY.md)** — Understand test patterns
4. **Explore the [Documentation Index](INDEX.md)** — Find what you need

---

> **Need help?** Check the CI/CD logs, open an issue, or refer to the agent definitions in `.github/agents/`.