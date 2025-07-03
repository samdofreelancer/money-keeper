<template>
  <div class="video-text-recognition">
    <div class="chat-container" ref="chatContainer">
      <p class="text">{{ recognizedText }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'

const recognizedText = ref('')

let eventSource: EventSource | null = null
const chatContainer = ref<HTMLElement | null>(null)

function startSSE() {
  eventSource = new EventSource('http://localhost:8080/api/stream/processed-text')
  eventSource.addEventListener('processed-text', async (event) => {
    try {
      const data = JSON.parse(event.data)
      recognizedText.value += (data.text || event.data) + ' '
    } catch {
      recognizedText.value += event.data + ' '
    }
    await nextTick()
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
  eventSource.onerror = (error) => {
    console.error('SSE error:', error)
    if (eventSource) {
      eventSource.close()
    }
  }
}

onMounted(() => {
  startSSE()
})

onBeforeUnmount(() => {
  if (eventSource) {
    eventSource.close()
  }
})
</script>

<style scoped>
.video-text-recognition {
  height: 100vh;
  max-width: 100vw;
  margin: 0;
  padding: 10px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.chat-container {
  flex: 1;
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  overflow-y: auto;
  font-family: monospace;
  font-size: 14px;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.chat-message {
  margin-bottom: 10px;
  padding: 6px 8px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  text-align: left;
}

.text {
  font-size: 14px;
  color: #333;
}
</style>
