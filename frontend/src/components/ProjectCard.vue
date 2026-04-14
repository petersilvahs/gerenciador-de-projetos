<script setup lang="ts">
import { computed } from 'vue';
import { Star, MoreHorizontal, Calendar, CheckSquare, Edit, Trash } from 'lucide-vue-next';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Projeto } from '../types';

const props = defineProps<{
  projeto: Projeto;
  highlight?: string;
}>();

const emit = defineEmits<{
  (e: 'favorite', id: string): void;
  (e: 'edit', id: string): void;
  (e: 'delete', id: string): void;
}>();

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  try {
    return format(parseISO(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  } catch {
    return dateString;
  }
};

const renderHighlight = (text: string) => {
  if (!props.highlight || props.highlight.length < 3) return text;
  const regex = new RegExp(`(${props.highlight})`, 'gi');
  return text.replace(regex, '<strong class="highlight">$1</strong>');
};

const nomeHtml = computed(() => renderHighlight(props.projeto.nome));
const clienteHtml = computed(() => renderHighlight(props.projeto.cliente));
</script>

<template>
  <div class="card">
    <div class="coverWrapper">
      <img v-if="projeto.capaUrl" :src="projeto.capaUrl" :alt="projeto.nome" class="coverImg" />
      <div v-else class="coverGradient">
        <img src="/assets/Image.svg" alt="Default Cover" class="coverSymbol" />
      </div>
      <div class="actions">
        <button class="actionBtn" @click="emit('favorite', projeto.id)">
          <Star 
            :size="18" 
            :fill="projeto.favorito ? 'var(--warn)' : 'transparent'" 
            :color="projeto.favorito ? 'var(--warn)' : 'white'" 
          />
        </button>
        <div class="menuWrapper">
          <button class="actionBtn dropdownToggle">
            <MoreHorizontal :size="18" color="var(--primary)" />
          </button>
          <div class="dropdown">
            <div class="dropdownPointer"></div>
            <button @click="emit('edit', projeto.id)">
              <Edit :size="18" color="var(--primary)" /> Editar
            </button>
            <hr class="dropdownDivider" />
            <button @click="emit('delete', projeto.id)">
              <Trash :size="18" color="var(--primary)" /> Remover
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="content">
      <h3 class="title" v-html="nomeHtml"></h3>
      <p class="client"><strong>Cliente:</strong> <span v-html="clienteHtml"></span></p>
      
      <div class="dates">
        <div class="dateRow">
          <Calendar :size="16" color="var(--text-light)" />
          <span>{{ formatDate(projeto.dataInicio) }}</span>
        </div>
        <div class="dateRow">
          <CheckSquare :size="16" color="var(--text-light)" />
          <span>{{ formatDate(projeto.dataFinal) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: var(--white);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transition: transform 0.2s;
  display: flex;
  flex-direction: column;
  width: 346px;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.coverWrapper {
  height: 160px;
  position: relative;
  background-color: var(--primary);
}

.coverImg {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.coverGradient {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #7c74ff, #524ade);
  display: flex;
  align-items: center;
  justify-content: center;
}

.coverSymbol {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.8;
}

.actions {
  position: absolute;
  bottom: 8px;
  right: 8px;
  display: flex;
  gap: 8px;
}

.actionBtn {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  backdrop-filter: blur(4px);
}

.actionBtn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.actionBtn.dropdownToggle {
  background: white;
}

.actionBtn.dropdownToggle:hover {
  background: #f0f0f0;
}

.menuWrapper {
  position: relative;
}

.dropdown {
  position: absolute;
  right: 0;
  bottom: calc(100% + 8px);
  background: var(--white);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  display: none;
  flex-direction: column;
  min-width: 200px;
  padding: 8px 0;
  z-index: 10;
}

.dropdownPointer {
  position: absolute;
  bottom: -6px;
  right: 12px;
  width: 14px;
  height: 14px;
  background: white;
  transform: rotate(45deg);
  z-index: -1;
  border-bottom-right-radius: 2px;
}

.menuWrapper:hover .dropdown,
.menuWrapper:focus-within .dropdown {
  display: flex;
}

.dropdown button {
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
  font-size: 16px;
  color: var(--primary);
  transition: background 0.2s;
}

.dropdown button:hover {
  background: var(--bg-light);
}

.dropdownDivider {
  border: 0;
  border-top: 1px solid var(--border);
  margin: 4px 0;
}

.content {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.title {
  font-size: 18px;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 4px;
}

.client {
  font-size: 14px;
  color: var(--text-light);
}

.client strong {
  color: var(--text-dark);
}

.dates {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-top: 1px solid var(--border);
  padding-top: 16px;
}

.dateRow {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-light);
}

:deep(.highlight) {
  background-color: rgba(99, 91, 255, 0.1);
  color: var(--primary);
  border-radius: 2px;
  padding: 0 2px;
}
</style>
