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
        String datasourcePassword = env.getProperty("spring.datasource.password");
        if (activeProfiles.length == 0) {
            logger.info("No active Spring profile set. Using default profile.");
        } else {
            logger.info("Active Spring profiles: {}", (Object) activeProfiles);
        }
        logger.info("Datasource URL: {}", datasourceUrl);

        // Skip check if local profile is active (H2 database)
        for (String profile : activeProfiles) {
            if ("local".equalsIgnoreCase(profile)) {
                logger.info("Local profile active, skipping Oracle password check.");
                return;
            }
        }

        boolean isCiProfile = false;
        for (String profile : activeProfiles) {
            if ("ci".equalsIgnoreCase(profile)) {
                isCiProfile = true;
                break;
            }
        }
        String ciPassword = System.getenv("ORACLE_PASSWORD");
        if (ciPassword == null) {
            logger.warn("Environment variable ORACLE_PASSWORD is not set.");
            // No fallback to hardcoded password for security reasons
            return;
        }
        if (ciPassword.equals(datasourcePassword) && !isCiProfile) {
            String errorMsg = "ERROR: Oracle password '" + ciPassword + "' is used in a non-CI environment! This is not allowed.";
            logger.error(errorMsg);
            throw new IllegalStateException(errorMsg);
        }
    }
}
