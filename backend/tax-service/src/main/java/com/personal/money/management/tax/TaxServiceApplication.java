package com.personal.money.management.tax;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.EnableEurekaClient;

@SpringBootApplication
@EnableEurekaClient
public class TaxServiceApplication {

    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(TaxServiceApplication.class);
        app.setAdditionalProfiles("local");
        app.run(args);
    }
}
