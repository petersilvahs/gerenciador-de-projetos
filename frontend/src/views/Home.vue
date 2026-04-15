<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Trash } from 'lucide-vue-next';
import { Projeto } from '../types';
import { api } from '../services/api';
import { hasProjects } from '../composables/useAppState';
import ProjectCard from '../components/ProjectCard.vue';
import Modal from '../components/Modal.vue';

type SortOption = 'alfa' | 'recentes' | 'prazo';

const route = useRoute();
const searchQ = computed(() => route.query.q as string || '');

const projetos = ref<Projeto[]>([]);
const apenasFavoritos = ref(false);
const sortOption = ref<SortOption>('alfa');
const loading = ref(true);
const error = ref<string | null>(null);
const deleteId = ref<string | null>(null);

const fetchProjetos = async () => {
  loading.value = true;
  error.value = null;
  try {
    const data = await api.getProjetos();
    projetos.value = data;
  } catch (e: any) {
    console.error(e);
    error.value = e.message || 'Erro ao carregar projetos. Verifique se a API está rodando.';
  } finally {
    loading.value = false;
    hasProjects.value = projetos.value.length > 0;
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
  <!-- Estado com painel branco centralizado (sem projetos) -->
  <div v-if="loading || error || (projetos.length === 0 && !searchQ)" class="pageWrapper">
    <div class="contentPanel">

      <div v-if="loading" class="loadingState">
        <div class="spinner"></div>
      </div>

      <div v-else-if="error" class="errorState">
        <div class="emptyContent">
          <h2 style="color: var(--danger)">Ops! Algo deu errado</h2>
          <p>{{ error }}</p>
          <button @click="fetchProjetos" class="btnSecondary">Tentar novamente</button>
        </div>
      </div>

      <div v-else class="emptyState">
        <div class="emptyContent">
          <h2>Nenhum projeto</h2>
          <p>Clique no botão abaixo para criar o primeiro e gerenciá-lo.</p>
          <router-link to="/projeto/novo" class="btnPrimary">
            <img src="/assets/plus-circle.svg" alt="Novo projeto" style="width: 18px; height: 18px;" />
            Novo projeto
          </router-link>
        </div>
      </div>

    </div>
  </div>

  <!-- Estado com projetos: layout tela cheia sem wrapper -->
  <div v-else class="projectsLayout">
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
            <img src="/assets/plus-circle.svg" alt="Novo projeto" style="width: 18px; height: 18px;" /> Novo projeto
          </router-link>
      </div>
    </div>

    <!-- Estado vazio de favoritos -->
    <div v-if="filteredAndSorted.length === 0 && apenasFavoritos" class="noFavoritesState">
      <p class="noFavoritesTitle">Nenhum projeto encontrado</p>
      <p class="noFavoritesSubtitle">Favorite seu projetos mais importantes</p>
    </div>

    <div v-else class="grid">
      <ProjectCard 
        v-for="projeto in filteredAndSorted" 
        :key="projeto.id" 
        :projeto="projeto" 
        :highlight="searchQ"
        @favorite="handleFavorite"
        @edit="(id) => $router.push(`/projeto/${id}/editar`)"
        @delete="id => deleteId = id"
      />
      <div v-if="filteredAndSorted.length === 0 && searchQ" style="text-align: center; padding: 40px; color: var(--text-light); width: 100%;">
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
.pageWrapper {
  height: calc(100vh - 80px);
  padding: 16px 24px;
  display: flex;
  justify-content: center;
  box-sizing: border-box;
  overflow: hidden;
}

.contentPanel {
  background: #ffffff;
  border-radius: 4px;
  width: 100%;
  height: 650px;
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.projectsLayout {
  padding: 32px 40px;
}

.noFavoritesState {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  gap: 8px;
  text-align: center;
}

.noFavoritesTitle {
  font-size: 22px;
  font-weight: 600;
  color: #1F1283;
  line-height: 100%;
}

.noFavoritesSubtitle {
  font-size: 16px;
  font-weight: 400;
  color: #717171;
  line-height: 22px;
}

.loadingState {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(105, 92, 205, 0.2);
  border-top-color: var(--bg-dark);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.emptyState {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.emptyContent {
  text-align: center;
}

.emptyContent h2 {
  font-size: 24px;
  color: #1F1283;
  margin-bottom: 12px;
  font-weight: 600;
  line-height: 100%;
}

.emptyContent p {
  color: #717171;
  font-size: 16px;
  font-weight: 400;
  line-height: 22px;
  margin-bottom: 24px;
}

.btnPrimary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: #695CCD;
  color: white;
  width: 184px;
  height: 40px;
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
  background-color: #FFB23D;
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
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  justify-content: flex-start;
}

.deleteModalContainer {
  position: relative;
  text-align: center;
  padding: 24px 32px 32px;
  min-height: 321px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.deleteModalIcon {
  position: absolute;
  top: -44px;
  left: 50%;
  transform: translateX(-50%);
  width: 48px;
  height: 48px;
  background-color: #695CCD;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.deleteModalTitle {
  font-size: 22px;
  color: var(--primary);
  font-weight: 600;
  line-height: 32px;
  margin-top: 16px;
  margin-bottom: 16px;
  text-align: center;
}
.deleteModalDivider {
  border: 0;
  border-top: 1px solid #8C8B93;
  margin-bottom: 16px;
  width: 100%;
}
.deleteModalText {
  color: var(--text-light);
  font-size: 16px;
  font-weight: 400;
  line-height: 22px;
  margin-bottom: 4px;
  text-align: center;
}
.deleteModalProjectName {
  font-size: 24px;
  font-weight: 500;
  line-height: 32px;
  color: #1C1930;
  margin-bottom: 24px;
  text-align: center;
}
.deleteModalActions {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-top: 8px;
}
.btnCancel {
  width: 226px;
  height: 52px;
  border-radius: 26px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: 0.2s;
  background: white;
  color: var(--primary);
  border: 1px solid #635bff;
}
.btnCancel:hover {
  background: rgba(99,91,255,0.05);
}
.btnConfirm {
  width: 260px;
  height: 52px;
  border-radius: 26px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: 0.2s;
  background: #695CCD;
  color: white;
  border: 1px solid #695CCD;
}
.btnConfirm:hover {
  background: #524ade;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .controls {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    width: 100%;
  }

  .controls .btnPrimary {
    margin: 0 auto;
    display: flex;
    justify-content: center;
  }

  .grid {
    justify-content: center;
  }

  .deleteModalContainer {
    padding: 20px 16px 24px;
    min-height: auto;
  }

  .deleteModalProjectName {
    font-size: 18px;
    margin-bottom: 16px;
  }

  .deleteModalActions {
    flex-direction: column;
    width: 100%;
    gap: 10px;
  }

  .btnCancel,
  .btnConfirm {
    width: 100%;
    max-width: 100%;
  }
}
</style>
