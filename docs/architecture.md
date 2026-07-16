# Money Keeper — System Architecture

> **Full-stack personal finance management application architecture**

---

## 📋 Table of Contents
- [System Overview](#-system-overview)
- [High-Level Architecture](#-high-level-architecture)
- [Backend Architecture](#-backend-architecture)
- [Frontend Architecture](#-frontend-architecture)
- [E2E Test Architecture](#-e2e-test-architecture)
- [Database Architecture](#-database-architecture)
- [Deployment Architecture](#-deployment-architecture)
- [API Design](#-api-design)
- [Security Architecture](#-security-architecture)
- [Technology Decisions](#-technology-decisions)

---

## 🏗️ System Overview

### What is Money Keeper?
Money Keeper is a full-stack personal finance management application that allows users to:
- Manage **accounts** (bank, cash, wallets)
- Track **transactions** (income, expense, transfers, borrow/lend, adjustments)
- Organize with **categories** (hierarchical classification)
- Calculate **taxes** (salary, annual settlements)
- View financial reports and analytics

### Tech Stack Summary

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                              │
│  Vue 3 + TypeScript + Vite + Element Plus + Pinia + Vue Router     │
│  Runs on: Browser / Nginx (Docker) / GKE (Kubernetes)              │
├─────────────────────────────────────────────────────────────────────┤
│                         API LAYER (REST)                            │
│  HTTP/HTTPS · JSON · Axios (client) · Spring Web (server)          │
├─────────────────────────────────────────────────────────────────────┤
│                         BACKEND LAYER                               │
│  Spring Boot (Java 17+) · Maven · DDD · Layered Architecture       │
│  Flyway Migrations · JaCoCo Coverage · SonarCloud Analysis         │
├─────────────────────────────────────────────────────────────────────┤
│                         DATABASE LAYER                              │
│  H2 (Local Dev) · Oracle 23c (CI/Production) · Flyway Versioning   │
├─────────────────────────────────────────────────────────────────────┤
│                     DEPLOYMENT & INFRASTRUCTURE                     │
│  Docker · Docker Compose · Kubernetes (GKE) · Helm · ghcr.io       │
│  GitHub Actions · ngrok · SonarCloud · GitHub Pages                 │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🏛️ High-Level Architecture

### System Context Diagram

```mermaid
flowchart TD
    USER[User/Browser] -->|HTTPS :443| LB[GKE LoadBalancer]
    LB --> FRONTEND[Frontend App<br/>Vue 3 + Nginx]
    FRONTEND -->|REST API JSON| BACKEND[Backend API<br/>Spring Boot :8080]
    BACKEND -->|JDBC :1521| DB[(Oracle Database)]
    
    BACKEND -->|Docker Network| FLYWAY[Flyway Migrations]
    
    DEV[Developer] -->|git push| GH[GitHub Repository]
    GH -->|GitHub Actions| CI[CI/CD Pipeline]
    CI -->|Build| DOCKER[Docker Images<br/>ghcr.io]
    CI -->|Deploy| GKE[GKE Cluster]
    CI -->|Analyze| SONAR[SonarCloud]
    CI -->|Reports| PAGES[GitHub Pages<br/>Allure Reports]
```

### C4 Container Diagram

```mermaid
C4Context
    Person(user, "User", "Personal finance manager")
    
    System_Boundary(mk, "Money Keeper System") {
        Container(fe, "Frontend", "Vue 3 + Vite", "User interface for managing finances")
        Container(be, "Backend API", "Spring Boot", "REST API for business logic")
        Container(db, "Database", "Oracle / H2", "Data persistence")
        Container(e2e, "E2E Tests", "Playwright + Cucumber", "Automated browser tests")
    }
    
    System_Ext(gh, "GitHub Actions", "CI/CD pipeline")
    System_Ext(sonar, "SonarCloud", "Code quality analysis")
    System_Ext(gke, "GKE", "Kubernetes hosting")
    System_Ext(ngrok, "ngrok", "Tunnel for CI testing")
    
    Rel(user, fe, "Uses", "HTTPS")
    Rel(fe, be, "Calls", "REST/JSON")
    Rel(be, db, "Reads/Writes", "JDBC")
    Rel(be, ngrok, "Exposed via", "Tunnel")
    Rel(gh, gke, "Deploys to", "Helm")
    Rel(gh, sonar, "Analyzes with", "SonarCloud")
```

---

## ☕ Backend Architecture

### Layered Architecture

```mermaid
flowchart TD
    subgraph "Presentation Layer"
        CONTROLLER["Controller Layer<br/>@RestController<br/>Request Validation<br/>HTTP Status Codes"]
    end
    
    subgraph "Business Layer"
        SERVICE["Service Layer<br/>@Service<br/>Business Logic<br/>@Transactional"]
    end
    
    subgraph "Persistence Layer"
        REPOSITORY["Repository Layer<br/>Spring Data JPA<br/>@Query<br/>Custom Queries"]
    end
    
    subgraph "Data Layer"
        DB[(Database<br/>H2 / Oracle)]
    end
    
    CONTROLLER --> SERVICE
    SERVICE --> REPOSITORY
    REPOSITORY --> DB
    
    DTO["DTO Layer<br/>Request/Response Objects<br/>Records<br/>Validation Annotations"] -.-> CONTROLLER
    ENTITY["Entity Layer<br/>@Entity<br/>Domain Objects<br/>JPA Mappings"] -.-> REPOSITORY
```

### Bounded Contexts (DDD)

```mermaid
flowchart TD
    subgraph "Money Keeper Core"
        ACCOUNT[Account Context<br/>Accounts, Balances]
        CATEGORY[Category Context<br/>Classifications, Hierarchy]
        TRANSACTION[Transaction Context<br/>Income, Expense, Transfer]
        TAX[Tax Context<br/>Salary Tax, Annual Settlement]
        EXCHANGE[Exchange Context<br/>Currency Conversion]
        SETTINGS[Settings Context<br/>User Preferences]
    end
    
    TRANSACTION --> ACCOUNT
    TRANSACTION --> CATEGORY
    TAX --> TRANSACTION
    EXCHANGE --> TRANSACTION
```

### Package Structure
```
com.personal.money.management.core
├── account/
│   ├── AccountController.java         # REST endpoints
│   ├── AccountService.java            # Business logic
│   ├── AccountRepository.java         # Data access
│   ├── Account.java                   # Domain entity
│   ├── AccountMapper.java             # Entity ↔ DTO
│   └── dto/
│       ├── CreateAccountRequest.java  # Input validation
│       ├── AccountResponse.java       # API response
│       └── AccountDTO.java            # Data transfer
├── category/
│   ├── CategoryController.java
│   ├── CategoryService.java
│   ├── CategoryRepository.java
│   ├── Category.java
│   └── dto/
├── transaction/
│   ├── TransactionController.java
│   ├── TransactionService.java
│   ├── TransactionRepository.java
│   ├── Transaction.java
│   └── dto/
├── tax/
│   ├── TaxController.java
│   ├── TaxService.java
│   ├── TaxCalculator.java
│   └── dto/
├── exchange/
│   └── ...
└── settings/
    └── ...
```

### REST Endpoints

| Method | Endpoint | Controller | Description |
|--------|----------|------------|-------------|
| GET | `/api/accounts` | Account | List all accounts |
| POST | `/api/accounts` | Account | Create account |
| GET | `/api/accounts/{id}` | Account | Get account by ID |
| PUT | `/api/accounts/{id}` | Account | Update account |
| DELETE | `/api/accounts/{id}` | Account | Delete account |
| GET | `/api/categories` | Category | List categories |
| POST | `/api/categories` | Category | Create category |
| GET | `/api/categories/{id}` | Category | Get category |
| POST | `/api/transactions` | Transaction | Create transaction |
| GET | `/api/transactions` | Transaction | List transactions |
| POST | `/api/tax/calculate` | Tax | Calculate tax |
| GET | `/api/tax/config` | Tax | Get tax configuration |
| GET | `/api/actuator/health` | Actuator | Health check |

---

## 🖥️ Frontend Architecture

### Component Architecture

```mermaid
flowchart TD
    subgraph "Entry"
        APP[App.vue<br/>Root Component]
        ROUTER[Vue Router<br/>Route Definitions]
    end
    
    subgraph "Views (Pages)"
        ACCOUNTS[AccountsView<br/>Account Management]
        CATEGORIES[CategoriesView<br/>Category Management]
        TRANSACTIONS[TransactionsView<br/>Transaction Management]
        TAX[TaxCalculatorView<br/>Tax Calculation]
    end
    
    subgraph "State Management"
        STORE[Pinia Stores<br/>accountStore<br/>categoryStore<br/>transactionStore<br/>taxStore]
    end
    
    subgraph "API Layer"
        API[API Modules<br/>accountApi.ts<br/>categoryApi.ts<br/>transactionApi.ts<br/>taxApi.ts]
    end
    
    subgraph "UI Components"
        UI[Element Plus<br/>Reusable Components<br/>Form Components]
    end
    
    ROUTER --> ACCOUNTS
    ROUTER --> CATEGORIES
    ROUTER --> TRANSACTIONS
    ROUTER --> TAX
    
    ACCOUNTS --> STORE
    CATEGORIES --> STORE
    TRANSACTIONS --> STORE
    
    STORE --> API
    
    ACCOUNTS --> UI
    CATEGORIES --> UI
    TRANSACTIONS --> UI
    
    API -->|Axios HTTP| BACKEND[Backend API :8080]
```

### Data Flow

```mermaid
sequenceDiagram
    participant User as User
    participant View as Vue View
    participant Store as Pinia Store
    participant API as API Module
    participant Backend as Backend API
    participant DB as Database
    
    User->>View: Click "Add Account"
    View->>Store: dispatch('createAccount', data)
    Store->>API: POST /api/accounts
    API->>Backend: HTTP Request
    Backend->>Backend: Validate & Process
    Backend->>DB: INSERT INTO accounts
    DB-->>Backend: Return created record
    Backend-->>API: 201 Created + AccountDTO
    API-->>Store: Return Account
    Store-->>Store: Update state
    Store-->>View: Reactive update
    View-->>User: Show new account in list
```

---

## 🧪 E2E Test Architecture

### Test Automation Stack

```mermaid
flowchart LR
    FEATURE[Feature Files<br/>*.feature · Gherkin] --> STEP[Step Definitions<br/>TypeScript]
    STEP --> ACTION[Actions<br/>Business Workflows]
    ACTION --> PAGE[Page Objects<br/>UI Interactions]
    PAGE --> PLAYWRIGHT[Playwright<br/>Browser Automation]
    
    subgraph "Support Layer"
        FIXTURE[Fixtures · Hooks]
        DATA[Test Data · Factories]
        ASSERT[Assertions · Verifications]
        HELPER[Helpers · Utilities]
    end
    
    STEP --> FIXTURE
    ACTION --> DATA
    STEP --> ASSERT
    ACTION --> HELPER
```

### Test Execution Flow (CI)

```mermaid
sequenceDiagram
    participant CI as CI Pipeline (ci.yml)
    participant DC as Docker Compose
    participant Oracle as Oracle DB
    participant Flyway as Flyway
    participant Backend as Backend App
    participant Frontend as Frontend App
    participant Playwright as Playwright Tests
    participant Report as Allure Report
    
    CI->>DC: Start services
    DC->>Oracle: Start container
    DC->>Flyway: Run migrations
    Flyway->>Oracle: Execute SQL
    DC->>Backend: Start application
    DC->>Frontend: Start application
    Backend->>Oracle: Connect & serve
    
    CI->>Playwright: Execute tests
    Playwright->>Frontend: Navigate & interact
    Frontend->>Backend: REST API calls
    Backend->>Oracle: Read/Write data
    
    Playwright-->>CI: Test results
    CI->>Report: Generate Allure report
    CI->>DC: Tear down services
```

---

## 🗄️ Database Architecture

### Database Strategy

| Environment | Database | Profile | Connection | Purpose |
|-------------|----------|---------|------------|---------|
| **Local Dev** | H2 In-Memory | `local` | `jdbc:h2:mem:moneykeeper` | Fast development |
| **CI Testing** | Oracle 23c | `ci` | `jdbc:oracle:thin:@localhost:1521/FREE` | Integration tests |
| **Production** | Oracle | — | Managed | Production data |

### ER Diagram

```mermaid
erDiagram
    ACCOUNT ||--o{ TRANSACTION : has
    TRANSACTION }o--|| CATEGORY : belongs_to
    ACCOUNT {
        long id PK
        string name UK
        string type
        long balance
        string currency
        string description
        timestamp created_at
        timestamp updated_at
    }
    TRANSACTION {
        long id PK
        long account_id FK
        long category_id FK
        long amount
        string transaction_type
        timestamp date_time
        string note
        string location
        long fee
        long source_account_id
        long destination_account_id
        timestamp created_at
    }
    CATEGORY {
        long id PK
        string name
        long parent_category_id FK
        string type
        timestamp created_at
    }
```

### Migration Structure

**Oracle Migrations** (`backend/src/main/resources/db/migration/oracle/`):
```
V0__create_core_user.sql       # Creates CORE schema/user (Oracle only)
V1__init.sql                   # Initial tables (accounts, categories)
V2__add_categories.sql         # Category enhancements
V4__add_transactions.sql       # Transaction table + types
V5__add_tax_tables.sql         # Tax calculation tables
```

**H2 Migrations** (`backend/src/main/resources/db/migration/h2/`):
```
V1__init.sql                   # Same schema as Oracle V1
V2__add_categories.sql         # Same as Oracle V2
V4__add_transactions.sql       # Same as Oracle V4
V5__add_tax_tables.sql         # Same as Oracle V5
```

> **Note:** Version 3 is intentionally skipped (historical gap).  
> Oracle has an additional `V0` for user creation (not needed in H2).

---

## 🚢 Deployment Architecture

### CI/CD Pipeline Architecture

```mermaid
flowchart TD
    subgraph "GitHub"
        REPO[GitHub Repository] -->|Push/PR| CI_MAIN[ci.yml]
        CI_MAIN --> PARALLEL{"Parallel Jobs"}
        PARALLEL --> UNIT[unit-test.yml<br/>Maven Unit Tests]
        PARALLEL --> INT[integration-test.yml<br/>Maven IT Tests + Oracle]
        UNIT --> ANALYSIS[code-analysis.yml<br/>SonarCloud]
        INT --> ANALYSIS
        UNIT --> E2E_LOCAL[e2e-test.yml<br/>Docker Compose E2E]
        INT --> E2E_LOCAL
    end
    
    subgraph "Manual Pipeline (GKE)"
        MANUAL[e2e-gke.yml<br/>workflow_dispatch] --> BUILD[build-images.yml<br/>Docker Build + Push]
        BUILD --> GHCR[ghcr.io<br/>Container Registry]
        BUILD --> DB_DEPLOY[deploy-backend.yml<br/>Oracle + Flyway + Backend + ngrok]
        BUILD --> FE_DEPLOY[deploy-frontend.yml<br/>GKE + Helm]
        DB_DEPLOY --> RUN_E2E[run-e2e.yml<br/>Playwright Tests]
        FE_DEPLOY --> RUN_E2E
        RUN_E2E --> CLEAN[cleanup.yml<br/>Delete Resources]
    end
    
    GHCR --> DB_DEPLOY
    GHCR --> FE_DEPLOY
```

### GKE Deployment

```mermaid
flowchart LR
    INTERNET[Internet] --> LB[GKE LoadBalancer<br/>Port 443]
    LB --> SVC[Frontend Service<br/>ClusterIP → LoadBalancer]
    SVC --> POD[Frontend Pod<br/>Nginx + Static Files]
    POD -->|VITE_API_BASE_URL| NGROK[ngrok Tunnel<br/>https://*.ngrok-free.app]
    NGROK -->|Reverse Proxy| BACKEND[Backend :8080<br/>GitHub Runner]
    BACKEND --> ORACLE[Oracle DB :1521<br/>Docker Container]
```

---

## 🔌 API Design

### API Conventions

| Aspect | Convention |
|--------|-----------|
| **Base URL** | `/api/{resource}` |
| **Format** | JSON (application/json) |
| **Response Envelope** | Direct object/array for success |
| **Error Format** | `{ "error": "message", "status": 400 }` |
| **Pagination** | `?page=0&size=20` with `Pageable` |
| **HTTP Methods** | GET (read), POST (create), PUT (update), DELETE (delete) |
| **Status Codes** | 200 OK, 201 Created, 204 No Content, 400 Bad Request, 404 Not Found, 409 Conflict |

### Example API Flow

```mermaid
sequenceDiagram
    participant Client as Client (Vue/Postman)
    participant API as Backend API
    participant Service as AccountService
    participant Repo as AccountRepository
    participant DB as Database
    
    Client->>API: POST /api/accounts
    Note over Client,API: { "name": "My Bank", "type": "Bank", "balance": 1000000 }
    
    API->>API: Validate request (@Valid)
    API->>Service: createAccount(request)
    Service->>Repo: existsByName("My Bank")
    Repo-->>Service: false
    Service->>Service: Map DTO → Entity
    Service->>Repo: save(account)
    Repo->>DB: INSERT INTO accounts
    DB-->>Repo: Return with ID
    Repo-->>Service: Account entity
    Service->>Service: Map Entity → DTO
    Service-->>API: AccountDTO
    
    API-->>Client: 201 Created
    Note over API,Client: { "id": 1, "name": "My Bank", "type": "Bank", "balance": 1000000 }
```

---

## 🔒 Security Architecture

### Authentication & Authorization

```mermaid
flowchart LR
    subgraph "Current (Simple)"
        CLIENT[Client] -->|Requests| API[API]
        API -->|Direct Access| DB[(Database)]
    end
    
    subgraph "Future (Planned)"
        CLIENT2[Client] -->|Login| AUTH[Auth Server]
        AUTH -->|JWT Token| CLIENT2
        CLIENT2 -->|Bearer Token| API2[API Gateway]
        API2 -->|Validate JWT| AUTH
        API2 -->|Authorized| SERVICE[Services]
    end
```

### Security Practices
- **Secrets**: All credentials stored in GitHub Secrets (never in code)
- **Database**: Oracle credentials injected via environment variables
- **GCP**: Service account with least-privilege IAM roles
- **ngrok**: Ephemeral tunnels generated per pipeline run
- **GHCR**: Images stored in private GitHub Container Registry
- **HTTPS**: LoadBalancer terminates TLS in production

---

## ✅ Technology Decisions

### Why This Stack?

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Backend Framework** | Spring Boot | Mature, extensive ecosystem, great DDD support |
| **Frontend Framework** | Vue 3 + Composition API | Lightweight, reactive, TypeScript support |
| **State Management** | Pinia | Official Vue 3 state management, TypeScript-first |
| **UI Library** | Element Plus | Comprehensive Vue 3 component library |
| **Database (Local)** | H2 | Zero-setup, in-memory, fast feedback |
| **Database (CI/Prod)** | Oracle | Enterprise-grade, project requirement |
| **ORM** | Spring Data JPA | Minimal boilerplate, custom query support |
| **Migrations** | Flyway | Version-controlled, H2 + Oracle compatible |
| **Testing (Unit)** | JUnit 5 + Mockito | Industry standard for Java |
| **Testing (E2E)** | Playwright + Cucumber | Cross-browser, BDD support, trace viewer |
| **CI/CD** | GitHub Actions | First-class GitHub integration, reusable workflows |
| **Container Registry** | ghcr.io | Built into GitHub, private packages |
| **Orchestration** | GKE + Helm | Managed Kubernetes, templated deployments |
| **Code Quality** | SonarCloud | Deep static analysis, quality gates |

---

## 📊 Architecture Decision Records (ADRs)

| ADR | Title | Decision |
|-----|-------|----------|
| [ADR-002](ADR-002-ANTI-CORRUPTION-LAYER.md) | Anti-Corruption Layer | Isolate domain from external systems |
| [ADR-003](ADR-003-AGGREGATE-ROOT-BOUNDARIES.md) | Aggregate Root Boundaries | Define clear aggregate boundaries |

### Design Principles

1. **Separation of Concerns** — Each layer has clear responsibilities
2. **Domain-Driven Design** — Models reflect business concepts, not database structure
3. **Testability** — Layers designed for isolated testing
4. **Reusability** — Components, actions, and workflows are composable
5. **Observability** — Health checks, logs, and metrics built in
6. **Security by Design** — Secrets management, least privilege, no hardcoded credentials

---

> **Last Updated**: 2026-07-16  
> **See also**: [Domain Model](domain-model.md), [Development Guide](DEVELOPMENT_GUIDE.md), [CI/CD Reference](CI_CD_REFERENCE.md)