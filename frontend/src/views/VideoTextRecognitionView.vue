<template>
  <div class="video-text-recognition-view">
    <h2>Video Text Recognition</h2>
    <VideoTextRecognition />
  </div>
</template>

<script setup lang="ts">
import VideoTextRecognition from '@/components/VideoTextRecognition.vue'
</script>

<style scoped>
.video-text-recognition-view {
  max-width: 800px;
  margin: 20px auto;
  padding: 10px;
}
</style>
