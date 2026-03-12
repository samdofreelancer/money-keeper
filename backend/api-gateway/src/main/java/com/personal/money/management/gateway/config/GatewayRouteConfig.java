package com.personal.money.management.gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Spring Cloud Gateway Route Configuration
 * Defines routing rules from gateway to microservices
 */
@Configuration
public class GatewayRouteConfig {

    /**
     * Configure routes for microservices
     */
    @Bean
    public RouteLocator moneyKeeperRoutes(RouteLocatorBuilder builder) {
        return builder.routes()
                // Money Keeper Service Routes - strip /api prefix, route to http://localhost:8080/accounts
                .route("accounts",
                        r -> r.path("/api/accounts/**")
                                .filters(f -> f.stripPrefix(1))
                                .uri("http://localhost:8080"))
                .route("categories",
                        r -> r.path("/api/categories/**")
                                .filters(f -> f.stripPrefix(1))
                                .uri("http://localhost:8080"))
                .route("exchange",
                        r -> r.path("/api/exchange/**")
                                .filters(f -> f.stripPrefix(1))
                                .uri("http://localhost:8080"))
                .route("settings",
                        r -> r.path("/api/settings/**")
                                .filters(f -> f.stripPrefix(1))
                                .uri("http://localhost:8080"))
                
                // Tax Service Routes - tax service has /api context path, strip prefix and keep /api
                .route("tax",
                        r -> r.path("/api/tax/**")
                                .uri("http://localhost:8082"))
                
                // Gateway health check
                .route("gateway-health",
                        r -> r.path("/health")
                                .uri("http://localhost:8081"))
                
                .build();
    }
}
