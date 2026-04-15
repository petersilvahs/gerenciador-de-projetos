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

const compressImage = (base64Str: string, maxWidth = 800): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
  });
};

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const compressed = await compressImage(reader.result as string);
      formData.value.capaUrl = compressed;
    };
    reader.readAsDataURL(file);
  }
};

const formRef = ref<HTMLFormElement | null>(null);
const wasValidated = ref(false);
const touched = ref<Record<string, boolean>>({
  nome: false,
  cliente: false,
  dataInicio: false,
  dataFinal: false,
});

const onBlur = (field: string) => {
  touched.value[field] = true;
};

const isFormValid = computed(() => {
  const nameOk = formData.value.nome && formData.value.nome.trim().split(/\s+/).length >= 2;
  const clientOk = formData.value.cliente && formData.value.cliente.trim().length > 0;
  const startOk = !!formData.value.dataInicio;
  const endOk = !!formData.value.dataFinal;
  return !!(nameOk && clientOk && startOk && endOk);
});

const handleSubmit = async (e: Event) => {
  wasValidated.value = true;
  if (!isFormValid.value) return;
  
  if (isEditing.value) {
    await api.updateProjeto(id, formData.value);
  } else {
    await api.createProjeto(formData.value);
  }
  await new Promise(resolve => setTimeout(resolve, 800));
  router.push('/');
};
</script>

<template>
  <div v-if="loading">Carregando...</div>
  <div v-else class="wrapper">
    <div class="pageHeader">
      <router-link to="/" class="backBtn">
        <ArrowLeft :size="16" /> Voltar
      </router-link>
      <h1 class="pageTitle">{{ isEditing ? 'Editar projeto' : 'Novo projeto' }}</h1>
    </div>

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
            @blur="onBlur('nome')"
            :class="{ 'input-touched-invalid': touched.nome && (formData.nome?.trim().split(/\s+/).length ?? 0) < 2 }"
          />
          <span class="errorMsg" :class="{ 'show': touched.nome && (formData.nome?.trim().split(/\s+/).length ?? 0) < 2 }">Por favor, digite ao menos duas palavras</span>
        </div>

        <div class="formGroup">
          <label>Cliente <span>(Obrigatório)</span></label>
          <input 
            type="text" 
            v-model="formData.cliente"
            required
            @blur="onBlur('cliente')"
            :class="{ 'input-touched-invalid': touched.cliente && !formData.cliente?.trim() }"
          />
          <span class="errorMsg" :class="{ 'show': touched.cliente && !formData.cliente?.trim() }">Por favor, digite ao menos uma palavra</span>
        </div>

        <div class="row">
          <div class="formGroup">
            <label>Data de Início <span>(Obrigatório)</span></label>
            <input 
              type="date" 
              v-model="formData.dataInicio"
              required
              @blur="onBlur('dataInicio')"
              :class="{ 'input-touched-invalid': touched.dataInicio && !formData.dataInicio }"
            />
            <span class="errorMsg" :class="{ 'show': touched.dataInicio && !formData.dataInicio }">Selecione uma data válida</span>
          </div>
          <div class="formGroup">
            <label>Data Final <span>(Obrigatório)</span></label>
            <input 
              type="date" 
              v-model="formData.dataFinal"
              :min="formData.dataInicio"
              required
              @blur="onBlur('dataFinal')"
              :class="{ 'input-touched-invalid': touched.dataFinal && !formData.dataFinal }"
            />
            <span class="errorMsg" :class="{ 'show': touched.dataFinal && !formData.dataFinal }">Selecione uma data válida</span>
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

        <button type="submit" class="btnSubmit" :disabled="!isFormValid">
          {{ isEditing ? 'Salvar alterações' : 'Salvar projeto' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  padding: 32px 40px;
}

.pageHeader {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 24px;
}

.backBtn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #695CCD;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
}

.backBtn:hover {
  text-decoration: underline;
}

.pageTitle {
  font-size: 24px;
  color: #1F1283;
  font-weight: 700;
  margin: 0;
}

.formCard {
  background: transparent;
  border-radius: 8px;
  padding: 32px;
  border: 1px solid #DCDCDC;
}

.formGroup {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.formGroup label {
  font-size: 14px;
  color: #695CCD;
}

.formGroup label span {
  color: var(--text-light);
  font-weight: 400;
  font-size: 12px;
}

.formGroup input[type="text"],
.formGroup input[type="date"] {
  padding: 12px;
  border: 1px solid #695CCD;
  border-radius: 4px;
  font-family: inherit;
  font-size: 14px;
  color: var(--text-dark);
  outline: none;
  transition: border-color 0.2s;
}

.formGroup input:focus {
  border-color: #695CCD;
  box-shadow: 0 0 0 3px rgba(105, 92, 205, 0.15);
}

.was-validated .formGroup:has(input:invalid) label {
  color: var(--danger, #e53935);
}

.was-validated .formGroup:has(input:invalid) label span {
  color: var(--danger, #e53935);
}

.was-validated input:invalid {
  border-color: var(--danger, #e53935);
  color: var(--danger, #e53935);
}

.was-validated input:invalid:focus {
  border-color: var(--danger, #e53935);
}

.errorMsg {
  display: none;
  color: var(--danger, #e53935);
  font-size: 14px;
}

.errorMsg.show {
  display: block;
}

.was-validated input:invalid ~ .errorMsg {
  display: block;
}

.input-touched-invalid {
  border-color: var(--danger, #e53935) !important;
  color: var(--danger, #e53935);
}

.input-touched-invalid:focus {
  border-color: var(--danger, #e53935) !important;
  box-shadow: 0 0 0 3px rgba(229, 57, 53, 0.15) !important;
}

.formGroup:has(.input-touched-invalid) label {
  color: var(--danger, #e53935);
}

.formGroup:has(.input-touched-invalid) label span {
  color: var(--danger, #e53935);
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
  display: block;
  width: 704px;
  max-width: 100%;
  height: 52px;
  background-color: #695CCD;
  color: white;
  margin: 16px auto 0;
  border-radius: 26px;
  font-size: 16px;
  font-weight: 600;
  transition: background-color 0.2s;
}

.btnSubmit:disabled {
  background-color: #B2A8FF;
  cursor: not-allowed;
}

.btnSubmit:not(:disabled):hover {
  background-color: var(--primary-hover);
}

@media (max-width: 768px) {
  .row {
    flex-direction: column;
    gap: 16px;
  }
}
</style>
