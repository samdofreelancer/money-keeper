package com.personal.money.management.common.config;

import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class ProfileLogger {
    private static final Logger log = LoggerFactory.getLogger(ProfileLogger.class);

    public ProfileLogger(Environment environment) {
        String[] activeProfiles = environment.getActiveProfiles();
        if (activeProfiles.length == 0) {
            activeProfiles = environment.getDefaultProfiles();
        }
        log.info("=====================================");
        log.info("Active Profiles: {}", (Object[]) activeProfiles);
        log.info("=====================================");
    }
}
