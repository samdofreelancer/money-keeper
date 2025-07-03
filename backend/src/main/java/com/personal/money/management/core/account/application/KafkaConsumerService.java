package com.personal.money.management.core.account.application;

import com.personal.money.management.core.config.KafkaConfig;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class KafkaConsumerService {

    private final SimpMessagingTemplate messagingTemplate;

    public KafkaConsumerService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @KafkaListener(topics = KafkaConfig.PROCESSED_TEXT_TOPIC, groupId = "money-keeper-group")
    public void listenProcessedText(String message) {
        // Send the processed text to frontend via WebSocket
        messagingTemplate.convertAndSend("/topic/processed-text", message);
    }
}
