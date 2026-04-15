<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRouter } from 'vue-router';
import { Search, X } from 'lucide-vue-next';

const emit = defineEmits<{
  (e: 'close'): void
}>();

const query = ref('');
const recentSearches = ref<string[]>([]);
const showDropdown = ref(false);
const inputRef = ref<HTMLInputElement | null>(null);
const wrapperRef = ref<HTMLElement | null>(null);

const router = useRouter();

const handleClickOutside = (e: MouseEvent) => {
  if (wrapperRef.value && !wrapperRef.value.contains(e.target as Node)) {
    emit('close');
  }
};

onMounted(() => {
  inputRef.value?.focus();
  const stored = localStorage.getItem('@Gerenciador:recentSearches');
  if (stored) {
    recentSearches.value = JSON.parse(stored);
  }
  showDropdown.value = true;
  document.addEventListener('mousedown', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside);
  router.replace('/');
});

watch(query, (newVal) => {
  router.replace(`/?q=${encodeURIComponent(newVal)}`);
});

const handleSearch = (searchTerm: string) => {
  if (searchTerm.trim().length === 0) return;
  
  const updatedRecents = [searchTerm, ...recentSearches.value.filter(s => s !== searchTerm)].slice(0, 5);
  recentSearches.value = updatedRecents;
  localStorage.setItem('@Gerenciador:recentSearches', JSON.stringify(updatedRecents));
  
  showDropdown.value = false;
  router.push(`/?q=${encodeURIComponent(searchTerm)}`);
};

const removeRecent = (index: number) => {
  recentSearches.value.splice(index, 1);
  localStorage.setItem('@Gerenciador:recentSearches', JSON.stringify(recentSearches.value));
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    handleSearch(query.value);
  } else if (e.key === 'Escape') {
    emit('close');
  }
};
</script>

<template>
  <div class="wrapper" ref="wrapperRef">
    <div class="searchContainer">
      <Search class="icon" color="#8e8e9c" :size="20" />
      <input
        ref="inputRef"
        type="text"
        placeholder="Digite o nome do projeto..."
        v-model="query"
        @input="showDropdown = true"
        @keydown="handleKeyDown"
        class="input"
      />
      <button class="closeBtn" @click="emit('close')">
        <X color="var(--text-light)" :size="20" />
      </button>
    </div>
    
    <div v-if="showDropdown && recentSearches.length > 0 && query.length < 3" class="dropdown">
      <div class="dropdownTitle">Buscas recentes</div>
      <ul>
        <li v-for="(term, index) in recentSearches" :key="index" class="dropdownItem" @click="() => { query = term; handleSearch(term); }">
          <div class="dropdownItemLeft">
            <img src="/assets/Icon.svg" alt="" class="historyIcon" />
            <span>{{ term }}</span>
          </div>
          <button class="removeBtn" @click.stop="removeRecent(index)">
            <X :size="14" color="var(--text-light)" />
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 800px;
  z-index: 50;
}
.searchContainer {
  display: flex; align-items: center; background-color: var(--white);
  border-radius: 8px; padding: 12px 16px; width: 100%;
  box-shadow: 0 8px 32px rgba(30, 27, 75, 0.15);
}
.input {
  border: none; background: transparent; padding: 8px 12px; outline: none;
  flex: 1; font-family: inherit; font-size: 16px; color: var(--text-dark);
}
.closeBtn {
  margin-left: 8px; display: flex; align-items: center; justify-content: center;
  background: transparent; border-radius: 50%; padding: 4px; cursor: pointer;
}
.dropdown {
  position: absolute; top: 100%; left: 0; width: 100%;
  background: var(--white); border-radius: 8px; margin-top: 8px;
  box-shadow: 0 8px 32px rgba(30, 27, 75, 0.15); padding: 8px 0; z-index: 10;
}
.dropdownTitle {
  font-size: 12px; color: var(--text-light); padding: 8px 16px;
  text-transform: uppercase; font-weight: 600;
}
.dropdownItem {
  padding: 8px 16px; display: flex; align-items: center; justify-content: space-between;
  cursor: pointer; color: var(--text-dark); font-size: 14px;
}
.dropdownItem:hover { background-color: var(--bg-light); }
.dropdownItemLeft {
  display: flex; align-items: center; gap: 8px;
}
.historyIcon {
  width: 16px; height: 16px;
}
.removeBtn {
  display: flex; align-items: center; justify-content: center;
  background: transparent; border: none; border-radius: 50%; padding: 4px;
  cursor: pointer; transition: background 0.2s;
}
.removeBtn:hover {
  background: rgba(0,0,0,0.08);
}
</style>
