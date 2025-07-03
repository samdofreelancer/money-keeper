package com.personal.money.management.core.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

/* WebSocketConfig disabled for SSE migration
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Added CORS allowed origins for localhost and all origins for testing
        registry.addEndpoint("/ws/recognition")
                .setAllowedOriginPatterns("http://localhost:3000", "http://localhost:5173", "*")
                .withSockJS();
    }
}
*/
