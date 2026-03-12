package com.personal.money.management.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * API Gateway Application
 * Spring Cloud Gateway for routing requests to microservices
 * 
 * Routes:
 *   /api/accounts/* -> http://money-keeper-service:8080/api/accounts/*
 *   /api/categories/* -> http://money-keeper-service:8080/api/categories/*
 *   /api/exchange/* -> http://money-keeper-service:8080/api/exchange/*
 *   /api/settings/* -> http://money-keeper-service:8080/api/settings/*
 *   /api/tax/* -> http://tax-service:8082/api/tax/*
 * 
 * Gateway runs on: http://localhost:8081
 */
@SpringBootApplication
@EnableDiscoveryClient
public class ApiGatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }
}
