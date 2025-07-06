package com.personal.money.management.core.chat.interfaces.api;

import com.personal.money.management.core.chat.application.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping
    public ResponseEntity<String> chat(@RequestBody ChatRequest chatRequest) {
        String userMessage = chatRequest.getMessage();
        String response = chatService.chatWithGemini(userMessage);
        return ResponseEntity.ok(response);
    }

    public static class ChatRequest {
        private String message;

        public ChatRequest() {
        }

        public ChatRequest(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}
