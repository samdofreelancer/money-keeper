<template>
  <div class="chat-container">
    <div class="messages" ref="messagesContainer">
      <div v-for="(msg, index) in messages" :key="index" :id="`message-${index}`" :class="['message-wrapper', msg.sender]">
        <div class="message-content" v-html="formatMessage(msg.text)"></div>
      </div>
      <div v-if="isTyping" class="typing-indicator">Typing...</div>
    </div>
    <form @submit.prevent="sendMessage" class="input-form">
      <input v-model="inputMessage" type="text" placeholder="Type your message..." required />
      <button type="submit">Send</button>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, nextTick, watch } from 'vue';
import { marked } from 'marked';

interface Message {
  text: string;
  sender: 'user' | 'ai';
}

export default defineComponent({
  name: 'ChatComponent',
  setup() {
    const messages = ref<Message[]>([]);
    const inputMessage = ref('');
    const messagesContainer = ref<HTMLElement | null>(null);
    const isTyping = ref(false);

    const sendMessage = async () => {
      if (!inputMessage.value.trim()) return;

      // Add user message
      messages.value.push({ text: inputMessage.value, sender: 'user' });
      const currentMessage = inputMessage.value;
      inputMessage.value = '';
      isTyping.value = true;

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: currentMessage }),
        });

        if (!response.body) {
          throw new Error('Response body is null');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let aiReply = '';
        messages.value.push({ text: aiReply, sender: 'ai' });

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          aiReply += decoder.decode(value, { stream: true });
          messages.value[messages.value.length - 1].text = aiReply;
        }
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

    // Format message text to support line breaks and basic markdown if needed
    const formatMessage = (text: string) => {
      if (!text) return '';
      return marked(text);
    };

    return {
      messages,
      inputMessage,
      sendMessage,
      messagesContainer,
      formatMessage,
      isTyping,
    };
  },
});
</script>

<style scoped>
.chat-container {
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
  font-style: italic;
  color: #666;
  margin: 5px 0;
}
</style>
