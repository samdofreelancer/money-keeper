package com.personal.money.management.core.chat.application;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

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

    public Flux<String> chatWithGemini(String userMessage) {
        String requestBody = "{ \"contents\": [ { \"parts\": [ { \"text\": \"" + userMessage + "\" } ] } ] }";

        return webClient.post()
                .uri(geminiApiUrl.replace(":generateContent", ":streamGenerateContent"))
                .header("X-goog-api-key", geminiApiKey)
                .header("Content-Type", "application/json")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToFlux(String.class)
                .map(this::extractTextFromResponse);
    }

    private String extractTextFromResponse(String response) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response);
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && candidates.size() > 0) {
                JsonNode firstCandidate = candidates.get(0);
                JsonNode contentNode = firstCandidate.path("content");
                JsonNode parts = contentNode.path("parts");
                if (parts.isArray() && parts.size() > 0) {
                    return parts.get(0).path("text").asText();
                }
            }
        } catch (Exception e) {
            return "Error parsing response";
        }
        return "";
    }
}
