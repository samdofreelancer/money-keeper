/* WebSocketController disabled for SSE migration
package com.personal.money.management.core.account.interfaces.api;

import com.personal.money.management.core.account.application.KafkaProducerService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

@Controller
public class WebSocketController {

    private final KafkaProducerService kafkaProducerService;

    public WebSocketController(KafkaProducerService kafkaProducerService) {
        this.kafkaProducerService = kafkaProducerService;
    }

    @MessageMapping("/send-recognized-text")
    public void receiveRecognizedText(String text) {
        // Send recognized text to Kafka topic
        kafkaProducerService.sendRecognizedText(text);
    }
}
*/
