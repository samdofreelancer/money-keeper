
package com.personal.money.management.core.history.interfaces.api;

import com.personal.money.management.core.history.application.HistoryService;
import com.personal.money.management.core.history.domain.Conversation;
import com.personal.money.management.core.history.domain.Message;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@AllArgsConstructor
public class HistoryControllerImpl implements HistoryController {

    private final HistoryService historyService;

    @Override
    public Conversation startConversation(StartConversationRequest request) {
        return historyService.startConversation(request.getUserId(), request.getTitle());
    }

    @Override
    public List<Conversation> getConversations(String userId) {
        return historyService.getConversations(userId);
    }

    @Override
    public List<Message> getMessages(Long conversationId) {
        return historyService.getMessages(conversationId);
    }

    @Override
    public void updateConversationTitle(Long conversationId, UpdateConversationTitleRequest request) {
        historyService.updateConversationTitle(conversationId, request.getTitle());
    }
}
