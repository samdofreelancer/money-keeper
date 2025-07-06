<template>
  <div class="chat-history-container">
    <div class="conversations">
      <button @click="startNewConversation">New Conversation</button>
      <ul>
        <li v-for="conversation in conversations" :key="conversation.id" @click="loadConversation(conversation.id)">
          {{ conversation.title }}
        </li>
      </ul>
    </div>
    <div class="chat-container">
      <div class="messages" ref="messagesContainer">
        <div v-for="(msg, index) in messages" :key="index" :id="`message-${index}`" :class="['message-wrapper', msg.sender]">
          <div class="message-content" v-html="formatMessage(msg.text)"></div>
        </div>
        <div v-if="isTyping" class="typing-indicator">
          Processing
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      <form @submit.prevent="sendMessage" class="input-form">
        <input v-model="inputMessage" type="text" placeholder="Type your message..." required />
        <button type="submit">Send</button>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, nextTick, watch, onMounted } from 'vue';
import axios from 'axios';
import { marked } from 'marked';

interface Message {
  text: string;
  sender: 'user' | 'ai';
}

interface Conversation {
  id: number;
  title: string;
}

export default defineComponent({
  name: 'ChatComponent',
  setup() {
    const messages = ref<Message[]>([]);
    const conversations = ref<Conversation[]>([]);
    const currentConversationId = ref<number | null>(null);
    const inputMessage = ref('');
    const messagesContainer = ref<HTMLElement | null>(null);
    const isTyping = ref(false);
    const userId = ref('123'); // Replace with actual user ID

    const fetchConversations = async () => {
      try {
        const response = await axios.get(`/api/history/conversations?userId=${userId.value}`);
        conversations.value = response.data;
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    const startNewConversation = async () => {
      try {
        const response = await axios.post('/api/history/conversations', { userId: userId.value, title: 'New Conversation' });
        currentConversationId.value = response.data.id;
        messages.value = [];
        fetchConversations();
      } catch (error) {
        console.error('Error starting new conversation:', error);
      }
    };

    const loadConversation = async (conversationId: number) => {
      try {
        const response = await axios.get(`/api/history/conversations/${conversationId}/messages`);
        messages.value = response.data.map((msg: any) => ({ text: msg.content, sender: msg.sender }));
        currentConversationId.value = conversationId;
      } catch (error) {
        console.error('Error loading conversation:', error);
      }
    };

    const sendMessage = async () => {
      if (!inputMessage.value.trim() || !currentConversationId.value) return;

      const isNewConversation = messages.value.length === 0;

      // Add user message
      messages.value.push({ text: inputMessage.value, sender: 'user' });
      const currentMessage = inputMessage.value;
      inputMessage.value = '';
      isTyping.value = true;

      try {
        if (isNewConversation) {
          await axios.put(`/api/history/conversations/${currentConversationId.value}/title`, { title: currentMessage });
          fetchConversations();
        }

        const response = await axios.post('/api/chat', { conversationId: currentConversationId.value, userId: userId.value, message: currentMessage });
        const aiReply = response.data;

        // Add AI response
        messages.value.push({ text: aiReply, sender: 'ai' });
      } catch (error) {
        messages.value.push({ text: 'Error: Unable to get response from AI.', sender: 'ai' });
      } finally {
        isTyping.value = false;
      }

      };

    watch(messages, async () => {
      if (messages.value.length === 0) return;
      await nextTick();
      const lastMessageIndex = messages.value.length - 1;
      const lastMessageElement = document.getElementById(`message-${lastMessageIndex}`);
      if (lastMessageElement) {
        lastMessageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, { deep: true });

    onMounted(() => {
      fetchConversations();
    });

    // Format message text to support line breaks and basic markdown if needed
    const formatMessage = (text: string) => {
      if (!text) return '';
      return marked(text);
    };

    return {
      messages,
      conversations,
      inputMessage,
      sendMessage,
      messagesContainer,
      formatMessage,
      isTyping,
      startNewConversation,
      loadConversation,
    };
  },
});
</script>

<style scoped>
.chat-history-container {
  display: flex;
  height: 100%;
}

.conversations {
  width: 200px;
  border-right: 1px solid #ccc;
  padding: 10px;
}

.conversations ul {
  list-style: none;
  padding: 0;
}

.conversations li {
  padding: 10px;
  cursor: pointer;
}

.conversations li:hover {
  background-color: #f0f0f0;
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid #ccc;
  padding: 10px;
  background-color: #f9f9f9;
}

.messages {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 10px;
  padding-right: 10px;
}

.message-wrapper {
  margin: 5px 0;
  max-width: 70%;
  word-wrap: break-word;
}

.message-wrapper.user {
  align-self: flex-end;
  background-color: #007bff;
  color: white;
  border-radius: 15px 15px 0 15px;
  padding: 8px 12px;
}

.message-wrapper.ai {
  align-self: flex-start;
  background-color: #e5e5ea;
  color: black;
  border-radius: 15px 15px 15px 0;
  padding: 8px 12px;
}

.input-form {
  display: flex;
}

input[type="text"] {
  flex: 1;
  padding: 8px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  padding: 8px 16px;
  font-size: 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
  margin-left: 8px;
  border-radius: 4px;
}
.typing-indicator {
  display: flex;
  align-items: center;
  margin: 5px 0;
}

.typing-indicator span {
  height: 8px;
  width: 8px;
  margin: 0 2px;
  background-color: #666;
  border-radius: 50%;
  display: inline-block;
  animation: bounce 1.4s infinite ease-in-out both;
}

.typing-indicator span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1.0);
  }
}
</style>
