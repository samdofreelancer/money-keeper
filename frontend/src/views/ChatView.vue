<template>
  <div class="chat-view full-height">
    <ChatComponent />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ChatComponent from '../components/ChatComponent.vue';

export default defineComponent({
  name: 'ChatView',
  components: {
    ChatComponent,
  },
});
</script>

<style scoped>
.chat-view {
  max-width: 600px;
  margin: 0 auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}
.full-height {
  height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
