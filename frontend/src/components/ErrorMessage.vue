<template>
  <div v-if="error" class="error-message">
    <el-alert
      :title="error"
      type="error"
      :closable="closable"
      show-icon
      @close="$emit('close')"
    />
  </div>
</template>

<script setup lang="ts">
defineProps({
  error: {
    type: String,
    default: ''
  },
  closable: {
    type: Boolean,
    default: true
  }
})

defineEmits(['close'])
</script>

<style scoped>
.error-message {
  margin-bottom: 16px;
}
</style>
