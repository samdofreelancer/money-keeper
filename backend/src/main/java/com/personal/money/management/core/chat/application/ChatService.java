package com.personal.money.management.core.chat.application;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
public class ChatService {

    private final WebClient webClient;

    @Value("${google.gemini.api.url}")
    private String geminiApiUrl;

    @Value("${google.gemini.api.key}")
    private String geminiApiKey;

    public ChatService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    public String chatWithGemini(String userMessage) {
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

        return content;
    }
}
