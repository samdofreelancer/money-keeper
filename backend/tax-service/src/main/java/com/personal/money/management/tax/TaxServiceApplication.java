package com.personal.money.management.tax;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

/**
 * Tax Service Spring Boot Application
 * Standalone microservice for tax calculations and reporting
 * 
 * Runs on: http://localhost:8082
 * API Docs: http://localhost:8082/api/swagger-ui.html
 */
@SpringBootApplication
@ComponentScan(basePackages = {
    "com.personal.money.management.tax",
    "com.personal.money.management.common"
})
public class TaxServiceApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(TaxServiceApplication.class, args);
    }
}
