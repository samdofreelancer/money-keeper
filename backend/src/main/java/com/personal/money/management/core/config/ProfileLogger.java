package com.personal.money.management.core.config;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class ProfileLogger {

    private static final Logger logger = LoggerFactory.getLogger(ProfileLogger.class);

    @Autowired
    private Environment env;

    @PostConstruct
    public void logActiveProfiles() {
        String[] activeProfiles = env.getActiveProfiles();
        String datasourceUrl = env.getProperty("spring.datasource.url");
        if (activeProfiles.length == 0) {
            logger.info("No active Spring profile set. Using default profile.");
        } else {
            logger.info("Active Spring profiles: {}", (Object) activeProfiles);
        }
        logger.info("Datasource URL: {}", datasourceUrl);
    }
}
