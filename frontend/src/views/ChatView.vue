<template>
  <div class="chat-view">
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
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
</style>
