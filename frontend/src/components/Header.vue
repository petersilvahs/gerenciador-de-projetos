<script setup lang="ts">
import { ref } from 'vue';
import { Search } from 'lucide-vue-next';
import SearchBar from './SearchBar.vue';

const isSearchOpen = ref(false);
</script>

<template>
  <header class="header">
    <div class="container">
      <div class="headerLeft"></div>
      
      <router-link to="/" class="brand">
        <img src="/assets/symbol.svg" alt="Symbol" class="symbol" />
        <img src="/assets/logo.svg" alt="Gerenciador de Projetos" class="logoText" />
      </router-link>

      <div class="actions">
        <SearchBar v-if="isSearchOpen" @close="isSearchOpen = false" />
        <button v-else class="searchBtn" @click="isSearchOpen = true">
          <Search color="white" :size="20" />
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  background-color: var(--bg-dark);
  height: 64px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 100%;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
}

.brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.symbol {
  height: 28px;
}

.logoText {
  height: 16px;
}

.actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.searchBtn {
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.searchBtn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>