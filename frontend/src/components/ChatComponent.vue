<template>
  <div class="chat-container">
    <div class="messages" ref="messagesContainer">
      <div v-for="(msg, index) in messages" :key="index" :class="['message-wrapper', msg.sender]">
        <div class="message-content" v-html="formatMessage(msg.text)"></div>
      </div>
    </div>
    <form @submit.prevent="sendMessage" class="input-form">
      <input v-model="inputMessage" type="text" placeholder="Type your message..." required />
      <button type="submit">Send</button>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, nextTick } from 'vue';
import axios from 'axios';

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

    const sendMessage = async () => {
      if (!inputMessage.value.trim()) return;

      // Add user message
      messages.value.push({ text: inputMessage.value, sender: 'user' });

      try {
        const response = await axios.post('/api/chat', { message: inputMessage.value });
        const aiReply = response.data;

        // Add AI response
        messages.value.push({ text: aiReply, sender: 'ai' });
      } catch (error) {
        messages.value.push({ text: 'Error: Unable to get response from AI.', sender: 'ai' });
      }

      inputMessage.value = '';

      // Scroll to bottom after message added
      await nextTick();
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
      }
    };

    // Format message text to support line breaks and basic markdown if needed
    const formatMessage = (text: string) => {
      if (!text) return '';
      // Escape HTML and replace newlines with <br>
      const escaped = text.replace(/&/g, "&amp;").replace(/</g, "<").replace(/>/g, ">");
      return escaped.replace(/\n/g, "<br>");
    };

    return {
      messages,
      inputMessage,
      sendMessage,
      messagesContainer,
      formatMessage,
    };
  },
});
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 400px;
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
</style>
