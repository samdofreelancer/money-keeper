package com.personal.money.management.core.config;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

@Component
public class ProfileLogger {

    private static final Logger logger = LoggerFactory.getLogger(ProfileLogger.class);

    @Autowired
    private Environment env;

    private static final Set<String> SKIP_PASSWORD_CHECK_PROFILES = new HashSet<>(Arrays.asList("local"));
    private static final Set<String> CI_PROFILES = new HashSet<>(Arrays.asList("ci"));

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

        // Check if any profile should skip the Oracle password check
        for (String profile : activeProfiles) {
            if (SKIP_PASSWORD_CHECK_PROFILES.contains(profile.toLowerCase())) {
                logger.info("Profile '{}' active, skipping Oracle password check.", profile);
                return;
            }
        }

        boolean isCiProfile = false;
        for (String profile : activeProfiles) {
            if (CI_PROFILES.contains(profile.toLowerCase())) {
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
