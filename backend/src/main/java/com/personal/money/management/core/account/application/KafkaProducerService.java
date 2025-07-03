package com.personal.money.management.core.account.application;

import com.personal.money.management.core.config.KafkaConfig;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class KafkaProducerService {

    private final KafkaTemplate<String, String> kafkaTemplate;

    public KafkaProducerService(KafkaTemplate<String, String> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void sendRecognizedText(String text) {
        kafkaTemplate.send(KafkaConfig.RECOGNIZED_TEXT_TOPIC, text);
    }
}
