<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft, Upload } from 'lucide-vue-next';
import { api } from '../services/api';
import { Projeto } from '../types';

const route = useRoute();
const router = useRouter();

const id = route.params.id as string;
const isEditing = computed(() => !!id);

const formData = ref<Partial<Projeto>>({
  nome: '',
  cliente: '',
  dataInicio: '',
  dataFinal: '',
  capaUrl: ''
});

const loading = ref(isEditing.value);

onMounted(async () => {
  if (isEditing.value) {
    const res = await api.getProjetos();
    const proj = res.find(p => p.id === id);
    if (proj) {
      formData.value = proj;
    }
    loading.value = false;
  }
});

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      formData.value.capaUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const formRef = ref<HTMLFormElement | null>(null);
const wasValidated = ref(false);

const handleSubmit = async (e: Event) => {
  wasValidated.value = true;
  if (!formRef.value?.checkValidity()) {
    return;
  }
  
  if (isEditing.value) {
    await api.updateProjeto(id, formData.value);
  } else {
    await api.createProjeto(formData.value);
  }
  router.push('/');
};
</script>

<template>
  <div v-if="loading">Carregando...</div>
  <div v-else class="wrapper">
    <router-link to="/" class="backBtn">
      <ArrowLeft :size="16" /> Voltar
    </router-link>
    
    <h1 class="pageTitle">{{ isEditing ? 'Editar projeto' : 'Novo projeto' }}</h1>

    <div class="formCard">
      <form 
        ref="formRef" 
        @submit.prevent="handleSubmit" 
        :class="{ 'was-validated': wasValidated }"
        novalidate
      >
        <div class="formGroup">
          <label>Nome do projeto <span>(Obrigatório)</span></label>
          <input 
            type="text" 
            v-model="formData.nome"
            required 
          />
        </div>

        <div class="formGroup">
          <label>Cliente <span>(Obrigatório)</span></label>
          <input 
            type="text" 
            v-model="formData.cliente"
            required 
          />
        </div>

        <div class="row">
          <div class="formGroup">
            <label>Data de Início <span>(Obrigatório)</span></label>
            <input 
              type="date" 
              v-model="formData.dataInicio"
              required 
            />
          </div>
          <div class="formGroup">
            <label>Data Final <span>(Obrigatório)</span></label>
            <input 
              type="date" 
              v-model="formData.dataFinal"
              :min="formData.dataInicio"
              required 
            />
          </div>
        </div>

        <div class="formGroup">
          <label>Capa do projeto</label>
          <div class="uploadArea">
            <input 
              type="file" 
              accept="image/png, image/jpeg" 
              id="fileUpload" 
              @change="handleFileChange"
              class="fileInput" 
            />
            <div v-if="formData.capaUrl" class="previewContainer">
              <img :src="formData.capaUrl" alt="Preview" class="previewImg" />
              <label htmlFor="fileUpload" class="btnSecondary">Alterar imagem</label>
            </div>
            <label v-else htmlFor="fileUpload" class="uploadLabel">
              <Upload :size="24" color="var(--text-light)" />
              <p>Escolha uma imagem .jpg ou .png no seu dispositivo</p>
              <span class="btnSecondary">Selecionar</span>
            </label>
          </div>
        </div>

        <button type="submit" class="btnSubmit">
          {{ isEditing ? 'Salvar alterações' : 'Salvar projeto' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  max-width: 800px;
  margin: 0 auto;
}

.backBtn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--primary);
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 16px;
}

.backBtn:hover {
  text-decoration: underline;
}

.pageTitle {
  font-size: 24px;
  color: var(--primary);
  font-weight: 700;
  margin-bottom: 24px;
}

.formCard {
  background: var(--white);
  border-radius: 8px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.formGroup {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.formGroup label {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary);
}

.formGroup label span {
  color: var(--text-light);
  font-weight: 400;
  font-size: 12px;
}

.formGroup input[type="text"],
.formGroup input[type="date"] {
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-family: inherit;
  font-size: 14px;
  color: var(--text-dark);
  outline: none;
  transition: border-color 0.2s;
}

.formGroup input:focus {
  border-color: var(--primary);
}

.was-validated input:invalid {
  border-color: var(--danger, #ff4c4c);
  background-color: rgba(255, 76, 76, 0.05);
}

.was-validated input:invalid:focus {
  border-color: var(--danger, #ff4c4c);
}

.row {
  display: flex;
  gap: 20px;
}

.row .formGroup {
  flex: 1;
}

.uploadArea {
  border: 1px dashed var(--border);
  border-radius: 4px;
  padding: 32px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-light);
}

.fileInput {
  display: none;
}

.uploadLabel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  width: 100%;
}

.uploadLabel p {
  color: var(--text-light);
  font-size: 14px;
}

.btnSecondary {
  display: inline-block;
  padding: 8px 24px;
  border: 1px solid var(--primary);
  color: var(--primary);
  border-radius: 20px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btnSecondary:hover {
  background-color: rgba(99, 91, 255, 0.1);
}

.previewContainer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.previewImg {
  max-width: 100%;
  max-height: 200px;
  border-radius: 4px;
  object-fit: contain;
}

.btnSubmit {
  width: 100%;
  background-color: var(--primary);
  color: white;
  padding: 14px;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
  margin-top: 16px;
  transition: background-color 0.2s;
  opacity: 0.5;
}

.btnSubmit:hover {
  background-color: var(--primary-hover);
  opacity: 1;
}
</style>
