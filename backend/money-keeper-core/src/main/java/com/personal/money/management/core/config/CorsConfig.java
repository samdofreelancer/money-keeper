package com.personal.money.management.core.config;

import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CORS configuration is now handled by Spring Cloud Gateway
 * This class is disabled to prevent duplicate CORS headers in microservices architecture
 * 
 * In microservices:
 * - Gateway handles CORS for all requests
 * - Individual services should NOT have their own CORS config
 */
// @Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Disabled - Gateway handles CORS
        /*
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173", "http://frontend:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
        */
    }
}
