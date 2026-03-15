package com.personal.money.management.core.exchange.application;

import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@EnableScheduling
public class ExchangeRateScheduler {

    private final ExchangeRateService service;

    public ExchangeRateScheduler(ExchangeRateService service) {
        this.service = service;
    }

    @Scheduled(cron = "0 0 1 * * *")
    public void refreshDaily() {
        service.refreshDaily();
    }
} 