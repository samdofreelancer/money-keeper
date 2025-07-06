package com.personal.money.management.core.chat.application;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.personal.money.management.core.history.application.HistoryService;
import com.personal.money.management.core.history.domain.Message;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;

@Service
public class ChatService {

    private final WebClient webClient;

    private final HistoryService historyService;

    @Value("${google.gemini.api.url}")
    private String geminiApiUrl;

    @Value("${google.gemini.api.key}")
    private String geminiApiKey;

    public ChatService(WebClient.Builder webClientBuilder, HistoryService historyService) {
        this.webClient = webClientBuilder.build();
        this.historyService = historyService;
    }

    public String chatWithGemini(Long conversationId, String userId, String userMessage) {
        // Save user message
        Message userMsg = new Message(null, conversationId, "user", userMessage, LocalDateTime.now());
        historyService.saveMessage(userMsg);

        // Construct request payload according to Google Gemini API spec
        String requestBody = "{ \"contents\": [ { \"parts\": [ { \"text\": \"" + userMessage + "\" } ] } ] }";

        // Call Google Gemini LLM API
        Mono<String> responseMono = webClient.post()
                .uri(geminiApiUrl)
                .header("X-goog-api-key", geminiApiKey)
                .header("Content-Type", "application/json")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class);

        // Blocking for simplicity; consider reactive approach in real app
        String response = responseMono.block();

        // Extract and return the generated text from response JSON (simplified)
        // In real implementation, parse JSON properly

        // Simple parsing to extract the first candidate's text part
        String content = "";
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response);
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && candidates.size() > 0) {
                JsonNode firstCandidate = candidates.get(0);
                JsonNode contentNode = firstCandidate.path("content");
                JsonNode parts = contentNode.path("parts");
                if (parts.isArray() && parts.size() > 0) {
                    content = parts.get(0).path("text").asText();
                }
            }
        } catch (Exception e) {
            content = "Error parsing response";
        }

        // Save AI message
        Message aiMsg = new Message(null, conversationId, "ai", content, LocalDateTime.now());
        historyService.saveMessage(aiMsg);

        return content;
    }
}
