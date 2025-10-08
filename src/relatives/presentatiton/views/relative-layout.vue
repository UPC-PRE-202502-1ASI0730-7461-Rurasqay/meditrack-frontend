<script setup>

import AppHeader from "../../../shared/presentation/components/app-header.vue";
import AppSidebar from "../../../shared/presentation/components/app-sidebar.vue";
</script>

<template>
  <div class="relative-layout">
    <app-header />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.relative-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
}

.main-content {
  margin-top: 60px;
  padding: 2rem;
  background: #fff;
  overflow-y: auto;
  flex: 1;
}
</style>
