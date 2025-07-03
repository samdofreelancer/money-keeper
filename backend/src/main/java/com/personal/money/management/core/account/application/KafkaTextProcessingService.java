package com.personal.money.management.core.account.application;

import com.personal.money.management.core.config.KafkaConfig;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class KafkaTextProcessingService {

    private final KafkaTemplate<String, String> kafkaTemplate;

    public KafkaTextProcessingService(KafkaTemplate<String, String> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    @KafkaListener(topics = KafkaConfig.RECOGNIZED_TEXT_TOPIC, groupId = "money-keeper-group")
    public void processRecognizedText(String message) {
        // Here you can add any processing logic if needed
        String processedText = message; // For now, just pass through

        // Send processed text to processed-text topic
        kafkaTemplate.send(KafkaConfig.PROCESSED_TEXT_TOPIC, processedText);
    }
}
