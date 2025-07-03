package com.personal.money.management.core.account.application;

import com.personal.money.management.core.config.KafkaConfig;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;

@Service
public class KafkaConsumerService {

    private final Set<SseEmitter> emitters = new CopyOnWriteArraySet<>();

    public SseEmitter subscribe() {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        emitters.add(emitter);
        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        return emitter;
    }

    @KafkaListener(topics = KafkaConfig.PROCESSED_TEXT_TOPIC, groupId = "money-keeper-group")
    public void listenProcessedText(String message) {
        System.out.println("Consumed processed text: " + message);
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name("processed-text").data(message));
            } catch (IOException e) {
                emitters.remove(emitter);
            }
        }
    }
}
