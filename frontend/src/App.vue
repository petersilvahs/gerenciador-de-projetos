<script setup lang="ts">
import Header from './components/Header.vue';
</script>

<template>
  <div class="layout">
    <Header />
    <main class="main">
      <div class="container">
        <router-view></router-view>
      </div>
    </main>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main {
  flex: 1;
  padding: 40px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}
</style>
