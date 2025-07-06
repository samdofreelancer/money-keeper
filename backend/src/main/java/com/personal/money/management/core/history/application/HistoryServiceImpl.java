
package com.personal.money.management.core.history.application;

import com.personal.money.management.core.history.domain.Conversation;
import com.personal.money.management.core.history.domain.ConversationRepository;
import com.personal.money.management.core.history.domain.Message;
import com.personal.money.management.core.history.domain.MessageRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@AllArgsConstructor
public class HistoryServiceImpl implements HistoryService {

    private final ConversationRepository conversationRepository;

    private final MessageRepository messageRepository;

    @Override
    public Conversation startConversation(String userId, String title) {
        Conversation conversation = new Conversation();
        conversation.setUserId(userId);
        conversation.setTitle(title);
        conversation.setCreatedAt(LocalDateTime.now());
        conversation.setUpdatedAt(LocalDateTime.now());
        return conversationRepository.save(conversation);
    }

    @Override
    public void saveMessage(Message message) {
        messageRepository.save(message);
    }

    @Override
    public List<Conversation> getConversations(String userId) {
        return conversationRepository.findAll();
    }

    @Override
    public List<Message> getMessages(Long conversationId) {
        return messageRepository.findByConversationId(conversationId);
    }

    @Override
    public void updateConversationTitle(Long conversationId, String title) {
        Conversation conversation = conversationRepository.findById(conversationId).orElseThrow();
        conversation.setTitle(title);
        conversation.setUpdatedAt(LocalDateTime.now());
        conversationRepository.save(conversation);
    }
}
