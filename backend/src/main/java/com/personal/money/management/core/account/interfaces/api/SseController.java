package com.personal.money.management.core.account.interfaces.api;

import com.personal.money.management.core.account.application.KafkaConsumerService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
public class SseController {

    private final KafkaConsumerService kafkaConsumerService;

    public SseController(KafkaConsumerService kafkaConsumerService) {
        this.kafkaConsumerService = kafkaConsumerService;
    }

    @GetMapping("/api/stream/processed-text")
    public SseEmitter streamProcessedText() {
        return kafkaConsumerService.subscribe();
    }
}
