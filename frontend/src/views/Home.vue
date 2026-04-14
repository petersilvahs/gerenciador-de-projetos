<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Plus, Trash } from 'lucide-vue-next';
import { Projeto } from '../types';
import { api } from '../services/api';
import ProjectCard from '../components/ProjectCard.vue';
import Modal from '../components/Modal.vue';

type SortOption = 'alfa' | 'recentes' | 'prazo';

const route = useRoute();
const searchQ = computed(() => route.query.q as string || '');

const projetos = ref<Projeto[]>([]);
const apenasFavoritos = ref(false);
const sortOption = ref<SortOption>('alfa');
const loading = ref(true);
const deleteId = ref<string | null>(null);

const fetchProjetos = async () => {
  try {
    const data = await api.getProjetos();
    projetos.value = data;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchProjetos();
});

const handleFavorite = async (id: string) => {
  const updated = await api.toggleFavorite(id);
  const index = projetos.value.findIndex(p => p.id === id);
  if (index !== -1) {
    projetos.value[index] = updated;
  }
};

const confirmDelete = async () => {
  if (deleteId.value) {
    await api.deleteProjeto(deleteId.value);
    projetos.value = projetos.value.filter(p => p.id !== deleteId.value);
    deleteId.value = null;
  }
};

const filteredAndSorted = computed(() => {
  let result = [...projetos.value];

  if (searchQ.value && searchQ.value.length > 0) {
    const qLower = searchQ.value.toLowerCase();
    result = result.filter(p => 
      p.nome.toLowerCase().includes(qLower) || 
      p.cliente.toLowerCase().includes(qLower)
    );
  }

  if (apenasFavoritos.value) {
    result = result.filter(p => p.favorito);
  }

  result.sort((a, b) => {
    switch (sortOption.value) {
      case 'alfa':
        return a.nome.localeCompare(b.nome);
      case 'recentes':
        return new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime();
      case 'prazo':
        if (!a.dataFinal) return 1;
        if (!b.dataFinal) return -1;
        return new Date(a.dataFinal).getTime() - new Date(b.dataFinal).getTime();
      default:
        return 0;
    }
  });

  return result;
});
</script>

<template>
  <div v-if="loading">Carregando...</div>
  
  <div v-else-if="projetos.length === 0 && !searchQ" class="emptyState">
    <div class="emptyContent">
      <h2>Nenhum projeto</h2>
      <p>Clique no botão abaixo para criar o primeiro e gerenciá-lo.</p>
      <router-link to="/projeto/novo" class="btnPrimary">
        <Plus :size="18" />
        Novo projeto
      </router-link>
    </div>
  </div>

  <div v-else>
    <div class="header">
      <div class="titleArea">
        <h1>Projetos <span>({{ filteredAndSorted.length }})</span></h1>
      </div>
      
      <div class="controls">
        <label class="toggle">
          <input type="checkbox" v-model="apenasFavoritos" />
          <span class="slider"></span>
          <span class="toggleLabel">Apenas Favoritos</span>
        </label>

        <select class="select" v-model="sortOption">
          <option value="alfa">Ordem alfabética</option>
          <option value="recentes">Iniciados mais recentes</option>
          <option value="prazo">Prazo mais próximo</option>
        </select>

        <router-link to="/projeto/novo" class="btnPrimary">
          <Plus :size="18" /> Novo projeto
        </router-link>
      </div>
    </div>

    <div class="grid">
      <ProjectCard 
        v-for="projeto in filteredAndSorted" 
        :key="projeto.id" 
        :projeto="projeto" 
        :highlight="searchQ"
        @favorite="handleFavorite"
        @edit="(id) => $router.push(`/projeto/${id}/editar`)"
        @delete="id => deleteId = id"
      />
      
      <div v-if="filteredAndSorted.length === 0 && searchQ" style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-light);">
        Nenhum projeto encontrado para a busca "{{ searchQ }}".
      </div>
    </div>

    <Modal 
      :isOpen="!!deleteId" 
      @close="deleteId = null" 
      hideHeader
    >
      <div class="deleteModalContainer">
        <div class="deleteModalIcon">
          <Trash color="white" :size="20" />
        </div>
        <h2 class="deleteModalTitle">Remover projeto</h2>
        <hr class="deleteModalDivider" />
        <p class="deleteModalText">Essa ação removerá definitivamente o projeto:</p>
        <p class="deleteModalProjectName">{{ projetos.find(p => p.id === deleteId)?.nome }}</p>
        <div class="deleteModalActions">
          <button class="btnCancel" @click="deleteId = null">Cancelar</button>
          <button class="btnConfirm" @click="confirmDelete">Confirmar</button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
.emptyState {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.emptyContent {
  text-align: center;
}

.emptyContent h2 {
  font-size: 24px;
  color: var(--primary);
  margin-bottom: 12px;
  font-weight: 700;
}

.emptyContent p {
  color: var(--text-light);
  margin-bottom: 24px;
}

.btnPrimary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: var(--primary);
  color: white;
  padding: 10px 20px;
  border-radius: 20px;
  font-weight: 500;
  font-size: 14px;
  transition: background-color 0.2s;
}

.btnPrimary:hover {
  background-color: var(--primary-hover);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.titleArea h1 {
  font-size: 24px;
  color: var(--primary);
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
}

.titleArea span {
  font-size: 14px;
  color: var(--primary);
  font-weight: 500;
}

.controls {
  display: flex;
  align-items: center;
  gap: 24px;
}

.toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.toggle input {
  display: none;
}

.slider {
  width: 40px;
  height: 24px;
  background-color: #d1d1d6;
  border-radius: 12px;
  position: relative;
  transition: 0.3s;
}

.slider::before {
  content: "";
  position: absolute;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  top: 3px;
  left: 3px;
  background-color: white;
  transition: 0.3s;
}

.toggle input:checked + .slider {
  background-color: var(--text-dark);
}

.toggle input:checked + .slider::before {
  transform: translateX(16px);
}

.toggleLabel {
  font-size: 14px;
  color: var(--text-dark);
}

.select {
  padding: 8px 16px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: white;
  color: var(--text-dark);
  font-family: inherit;
  font-size: 14px;
  outline: none;
  min-width: 200px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(346px, 1fr));
  gap: 24px;
}

.deleteModalContainer {
  position: relative;
  text-align: center;
  padding: 16px 24px;
}
.deleteModalIcon {
  position: absolute;
  top: -44px;
  left: 50%;
  transform: translateX(-50%);
  width: 48px;
  height: 48px;
  background-color: var(--primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.deleteModalTitle {
  font-size: 18px;
  color: var(--primary);
  font-weight: 700;
  margin-top: 16px;
  margin-bottom: 16px;
}
.deleteModalDivider {
  border: 0;
  border-top: 1px solid var(--border);
  margin-bottom: 16px;
}
.deleteModalText {
  color: var(--text-light);
  font-size: 14px;
  margin-bottom: 4px;
}
.deleteModalProjectName {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 24px;
}
.deleteModalActions {
  display: flex;
  gap: 16px;
}
.btnCancel, .btnConfirm {
  flex: 1;
  padding: 10px 0;
  border-radius: 20px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: 0.2s;
}
.btnCancel {
  background: white;
  color: var(--primary);
  border: 1px solid var(--primary);
}
.btnCancel:hover {
  background: rgba(99,91,255,0.05);
}
.btnConfirm {
  background: var(--primary);
  color: white;
  border: 1px solid var(--primary);
}
.btnConfirm:hover {
  background: var(--primary-hover);
}
</style>
