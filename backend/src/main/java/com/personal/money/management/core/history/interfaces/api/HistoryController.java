
package com.personal.money.management.core.history.interfaces.api;

import com.personal.money.management.core.history.domain.Conversation;
import com.personal.money.management.core.history.domain.Message;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/history")
public interface HistoryController {

    @PostMapping("/conversations")
    Conversation startConversation(@RequestBody StartConversationRequest request);

    @GetMapping("/conversations")
    List<Conversation> getConversations(@RequestParam String userId);

    @GetMapping("/conversations/{conversationId}/messages")
    List<Message> getMessages(@PathVariable Long conversationId);

    @PutMapping("/conversations/{conversationId}/title")
    void updateConversationTitle(@PathVariable Long conversationId, @RequestBody UpdateConversationTitleRequest request);
}
