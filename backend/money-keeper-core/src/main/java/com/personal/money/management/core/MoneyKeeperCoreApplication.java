package com.personal.money.management.core;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.EnableEurekaClient;

@SpringBootApplication
@EnableEurekaClient
public class MoneyKeeperCoreApplication {

    public static void main(String[] args) {
        SpringApplication.run(MoneyKeeperCoreApplication.class, args);
    }
}
