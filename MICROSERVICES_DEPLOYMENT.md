# Money Keeper Microservices - Deployment Guide

## Architecture Overview

The Money Keeper application has been successfully refactored into a microservices architecture:

```
Frontend (Port 3000)
    ↓
API Gateway (Port 8081) [Spring Cloud Gateway]
    ├─→ Money-Keeper Service (Port 8080) [Spring Boot Web]
    │   ├─ Accounts API
    │   ├─ Categories API
    │   ├─ Currencies API
    │   ├─ Exchange Rates API
    │   └─ Settings API
    │
    └─→ Tax Service (Port 8082) [Spring Boot Web]
        └─ Tax Calculation API
```

## Service Configuration

### API Gateway (Port 8081)
- **Framework**: Spring Cloud Gateway with WebFlux (Reactive)
- **Routes**:
  - `/api/accounts/**` → Money-Keeper Service (8080)
  - `/api/categories/**` → Money-Keeper Service (8080)
  - `/api/currencies/**` → Money-Keeper Service (8080)
  - `/api/exchange-rates/**` → Money-Keeper Service (8080)
  - `/api/settings/**` → Money-Keeper Service (8080)
  - `/api/tax/**` → Tax Service (8082)
- **CORS**: Enabled for all origins
- **Build**: `backend/api-gateway/target/api-gateway-1.0-SNAPSHOT.jar`

### Money-Keeper Service (Port 8080)
- **Framework**: Spring Boot with Spring Web MVC (Blocking/Tomcat)
- **Database**: H2 (development), Oracle (production)
- **Context Path**: None (routes from gateway include `/api`)
- **Controllers**:
  - `/api/accounts` - Account management
  - `/api/categories` - Category management
  - `/api/currencies` - Currency management
  - `/api/exchange-rates` - Exchange rate management
  - `/api/settings` - Application settings
- **Build**: `backend/money-keeper-service/target/money-keeper-service-1.0-SNAPSHOT.jar`

### Tax Service (Port 8082)
- **Framework**: Spring Boot with Spring Web MVC (Blocking/Tomcat)
- **Database**: H2 (development), Oracle (production)
- **Context Path**: `/api` (tax-service handles its own `/api` prefix)
- **Controller**: `/api/tax/**` - Tax calculations
- **Build**: `backend/tax-service/target/tax-service-1.0-SNAPSHOT.jar`

### Frontend (Port 3000)
- **API Base URL**: `http://localhost:8081/api` (development)
- **Build Environment**: `.env.development`
- **Configuration**: 
  ```
  VITE_API_URL=http://localhost:8081/api
  ```

## Running the Services

### Prerequisites
- Java 18+ (or 21 recommended)
- Maven 3.9.x
- Node.js 16+ (for frontend)

### Build Backend
```bash
cd backend
mvn clean package -DskipTests
```

### Start Services (Terminal 1 - API Gateway)
```bash
cd backend
java -jar api-gateway/target/api-gateway-1.0-SNAPSHOT.jar
```

### Start Services (Terminal 2 - Money-Keeper)
```bash
cd backend
java -jar money-keeper-service/target/money-keeper-service-1.0-SNAPSHOT.jar
```

### Start Services (Terminal 3 - Tax Service)
```bash
cd backend
java -jar tax-service/target/tax-service-1.0-SNAPSHOT.jar
```

### Start Frontend (Terminal 4)
```bash
cd frontend
npm install
npm run dev
```

Access frontend at: `http://localhost:3000`

## Production Deployment

### Using Oracle Database
Start services with `--spring.profiles.active=oracle`:

```bash
java -jar api-gateway-1.0-SNAPSHOT.jar
java -jar money-keeper-service-1.0-SNAPSHOT.jar --spring.profiles.active=oracle
java -jar tax-service-1.0-SNAPSHOT.jar --spring.profiles.active=oracle
```

### Using Environment Variables
Set `VITE_API_URL` for the frontend:
```bash
VITE_API_URL=http://api-gateway:8081/api npm run build
```

## Database Migrations

### H2 (Development)
Located in: `backend/*/src/main/resources/db/migration/h2/`
- Automatic migration on startup
- Schema: `PUBLIC` (default H2 schema)

### Oracle (Production)
Located in: `backend/*/src/main/resources/db/migration/oracle/`
- Automatic migration on startup with `--spring.profiles.active=oracle`
- Schema: `CORE`

## API Endpoints

### Gateway Root
- `GET http://localhost:8081/` - Returns 404 (expected)
- `GET http://localhost:8081/health` - Gateway health

### Money-Keeper Service
All endpoints accessible via Gateway:
- `GET http://localhost:8081/api/accounts` - List accounts
- `POST http://localhost:8081/api/accounts` - Create account
- `GET http://localhost:8081/api/categories` - List categories
- `GET http://localhost:8081/api/currencies` - List currencies
- `GET http://localhost:8081/api/exchange-rates/latest?base=USD` - Get exchange rates
- `GET http://localhost:8081/api/settings` - Get settings

### Tax Service
- `GET http://localhost:8081/api/tax/calculate` - Calculate taxes

## Troubleshooting

### Port Already in Use
```bash
# Linux/Mac
lsof -i :8080  # or 8081, 8082, 3000
kill -9 <PID>

# Windows
netstat -ano | grep :8080
taskkill /PID <PID> /F
```

### Services Not Responding
1. Check if all three services started successfully
2. Verify no compilation errors: `mvn clean compile`
3. Check logs for database connection issues
4. Ensure ports 8080, 8081, 8082 are available

### CORS Errors
- CORS is enabled on the API Gateway
- Frontend must use `http://localhost:8081/api` (not direct service ports)
- Check `.env.development` has correct `VITE_API_URL`

### Database Errors
- H2 database is in-memory (resets on restart)
- Oracle requires proper database setup and configuration
- Check Flyway migrations are running: Look for `Flyway` log messages on startup

## Build Artifacts

After running `mvn clean package`:

```
backend/
├── api-gateway/target/
│   └── api-gateway-1.0-SNAPSHOT.jar (53 MB)
├── common-lib/target/
│   └── common-lib-1.0-SNAPSHOT.jar (8.4 KB)
├── money-keeper-service/target/
│   └── money-keeper-service-1.0-SNAPSHOT.jar (53 MB)
└── tax-service/target/
    └── tax-service-1.0-SNAPSHOT.jar (53 MB)
```

## Summary

✅ Monolithic backend successfully refactored into 3 microservices
✅ API Gateway routing configured for all endpoints
✅ CORS enabled for frontend integration
✅ H2 database for development, Oracle support for production
✅ Flyway migrations automated
✅ All services compile and run successfully
✅ Frontend integrated with gateway routing

The system is ready for deployment!
