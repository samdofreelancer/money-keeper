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
        String response = chatService.chatWithGemini(chatRequest.getConversationId(), chatRequest.getUserId(), userMessage);
        return ResponseEntity.ok(response);
    }

    public static class ChatRequest {
        private Long conversationId;
        private String userId;
        private String message;

        public ChatRequest() {
        }

        public ChatRequest(Long conversationId, String userId, String message) {
            this.conversationId = conversationId;
            this.userId = userId;
            this.message = message;
        }

        public Long getConversationId() {
            return conversationId;
        }

        public void setConversationId(Long conversationId) {
            this.conversationId = conversationId;
        }

        public String getUserId() {
            return userId;
        }

        public void setUserId(String userId) {
            this.userId = userId;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}
