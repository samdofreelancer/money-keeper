# Spring Boot DDD Category Project

This project is a Spring Boot application demonstrating Domain Driven Design (DDD) principles for managing categories. Each category can have a parent category, an icon, a name, and a type (either expense or income).

## Project Structure

```
springboot-ddd-category
├── src
│   ├── main
│   │   ├── java
│   │   │   └── com
│   │   │       └── example
│   │   │           └── category
│   │   │               ├── CategoryApplication.java
│   │   │               ├── application
│   │   │               │   └── CategoryService.java
│   │   │               ├── domain
│   │   │               │   ├── model
│   │   │               │   │   ├── Category.java
│   │   │               │   │   └── CategoryType.java
│   │   │               │   └── repository
│   │   │               │       └── CategoryRepository.java
│   │   │               ├── infrastructure
│   │   │               │   └── persistence
│   │   │               │       └── CategoryJpaRepository.java
│   │   │               └── interfaces
│   │   │                   └── api
│   │   │                       ├── CategoryController.java
│   │   │                       └── dto
│   │   │                           ├── CategoryRequest.java
│   │   │                           └── CategoryResponse.java
│   │   └── resources
│   │       ├── application.properties
│   │       └── db
│   │           └── migration
│   │               └── V1__init.sql
│   └── test
│       └── java
│           └── com
│               └── example
│                   └── category
│                       └── CategoryApplicationTests.java
├── pom.xml
└── README.md
```

## Setup Instructions

1. **Clone the Repository**
   ```sh
   git clone <repository-url>
   cd springboot-ddd-category
   ```

2. **Configure the Database**
   - By default, the application uses MySQL. Update `src/main/resources/application.properties` with your database credentials.
   - For testing, H2 is included as a runtime dependency.

3. **Build the Project**
   ```sh
   mvn clean install
   ```

4. **Run the Application**
   ```sh
   mvn spring-boot:run
   ```

5. **API Endpoints**
   - **POST** `/api/categories` — Create a new category.
   - **(You can extend with GET, PUT, DELETE as needed.)**

## Example Usage

**Create a Category**

POST `/api/categories`  
Request body:
```json
{
  "name": "Groceries",
  "icon": "shopping_cart",
  "type": "EXPENSE",
  "parentId": null
}
```

**Response**
```json
{
  "id": 1,
  "name": "Groceries",
  "icon": "shopping_cart",
  "type": "EXPENSE",
  "parentId": null
}
```

## DDD Layers in This Project

- **Domain**: Business logic and core models ([`Category`](src/main/java/com/personal/money/management/core/category/domain/model/Category.java), [`CategoryType`](src/main/java/com/personal/money/management/core/category/domain/model/CategoryType.java), [`CategoryRepository`](src/main/java/com/personal/money/management/core/category/domain/repository/CategoryRepository.java))
- **Application**: Application services ([`CategoryService`](src/main/java/com/personal/money/management/core/category/application/CategoryService.java))
- **Infrastructure**: Persistence implementation ([`CategoryJpaRepository`](src/main/java/com/personal/money/management/core/category/infrastructure/persistence/CategoryJpaRepository.java))
- **Interfaces**: API controllers and DTOs ([`CategoryController`](src/main/java/com/personal/money/management/core/category/interfaces/api/CategoryController.java), [`CategoryRequest`](src/main/java/com/personal/money/management/core/category/interfaces/api/dto/CategoryRequest.java), [`CategoryResponse`](src/main/java/com/personal/money/management/core/category/interfaces/api/dto/CategoryResponse.java))

## License

This project is licensed under the MIT License.