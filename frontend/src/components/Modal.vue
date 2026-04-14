<script setup lang="ts">
import { X } from 'lucide-vue-next';

defineProps<{
  isOpen: boolean;
  title?: string;
  hideHeader?: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();
</script>

<template>
  <div v-if="isOpen" class="overlay" @click="emit('close')">
    <div class="modal" @click.stop>
      <div v-if="!hideHeader" class="header">
        <h2>{{ title }}</h2>
        <button class="closeBtn" @click="emit('close')">
          <X :size="20" color="var(--text-light)" />
        </button>
      </div>
      <div class="content">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(30, 27, 75, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(2px);
}

.modal {
  background: var(--white);
  border-radius: 8px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.header {
  padding: 20px;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h2 {
  font-size: 18px;
  color: var(--primary);
  font-weight: 600;
}

.closeBtn {
  padding: 4px;
  border-radius: 50%;
  display: flex;
  transition: background 0.2s;
}

.closeBtn:hover {
  background: var(--bg-light);
}

.content {
  padding: 20px;
}
</style>
