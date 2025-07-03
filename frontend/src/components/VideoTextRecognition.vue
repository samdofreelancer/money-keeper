<template>
  <div class="video-text-recognition">
    <h3>Real-time Video Text Recognition</h3>
    <video ref="video" autoplay muted playsinline width="400" height="300" class="video-element"></video>
    <canvas ref="canvas" width="400" height="300" style="display:none;"></canvas>
    <div class="recognized-text">
      <h4>Recognized Text:</h4>
      <pre>{{ recognizedText }}</pre>
    </div>
    <div class="processed-text">
      <h4>Processed Text from Backend:</h4>
      <pre>{{ processedText }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import Tesseract from 'tesseract.js'

const video = ref<HTMLVideoElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const recognizedText = ref('')
const processedText = ref('')

let ws: WebSocket | null = null
let stream: MediaStream | null = null
let ocrInterval: number | null = null

function startWebSocket() {
  ws = new WebSocket('ws://localhost:8080/ws/recognition')
  ws.onopen = () => {
    console.log('WebSocket connected')
  }
  ws.onmessage = (event) => {
    processedText.value = event.data
  }
  ws.onclose = () => {
    console.log('WebSocket disconnected')
  }
  ws.onerror = (error) => {
    console.error('WebSocket error:', error)
  }
}

async function startVideo() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true })
    if (video.value) {
      video.value.srcObject = stream
    }
  } catch (err) {
    console.error('Error accessing webcam:', err)
  }
}

async function performOCR() {
  if (!video.value || !canvas.value) return
  const ctx = canvas.value.getContext('2d')
  if (!ctx) return

  ctx.drawImage(video.value, 0, 0, canvas.value.width, canvas.value.height)
  const imageData = canvas.value.toDataURL('image/png')

  try {
    const result = await Tesseract.recognize(imageData, 'eng', { logger: m => {} })
    const text = result.data.text.trim()
    if (text && text !== recognizedText.value) {
      recognizedText.value = text
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(text)
      }
    }
  } catch (err) {
    console.error('OCR error:', err)
  }
}

onMounted(async () => {
  startWebSocket()
  await startVideo()
  ocrInterval = window.setInterval(performOCR, 3000) // OCR every 3 seconds
})

onBeforeUnmount(() => {
  if (ws) {
    ws.close()
  }
  if (stream) {
    stream.getTracks().forEach(track => track.stop())
  }
  if (ocrInterval) {
    clearInterval(ocrInterval)
  }
})
</script>

<style scoped>
.video-text-recognition {
  max-width: 420px;
  margin: 20px auto;
  text-align: center;
}

.video-element {
  border: 1px solid #ccc;
  border-radius: 4px;
}

.recognized-text, .processed-text {
  margin-top: 10px;
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  white-space: pre-wrap;
  word-wrap: break-word;
  min-height: 50px;
  font-family: monospace;
  font-size: 14px;
}
</style>
