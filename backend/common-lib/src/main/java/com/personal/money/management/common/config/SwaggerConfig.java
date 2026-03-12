package com.personal.money.management.common.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springdoc.api.springdoc.SpringDocConfigProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;

@Configuration
@EnableConfigurationProperties(SpringDocConfigProperties.class)
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Money Keeper API")
                        .version("1.0.0")
                        .description("Domain-Driven Design based Money Management Application"));
    }
}
