
package com.personal.money.management.core.history.application;

import com.personal.money.management.core.history.domain.Conversation;
import com.personal.money.management.core.history.domain.Message;

import java.util.List;

public interface HistoryService {

    Conversation startConversation(String userId, String title);

    void saveMessage(Message message);

    List<Conversation> getConversations(String userId);

    List<Message> getMessages(Long conversationId);

    void updateConversationTitle(Long conversationId, String title);
}
