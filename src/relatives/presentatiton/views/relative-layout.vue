<script setup>

import AppHeader from "../../../shared/presentation/components/app-header.vue";
import AppSidebar from "../../../shared/presentation/components/app-sidebar.vue";
</script>

<template>
  <div class="relative-layout">
    <app-header />
    <div class="layout-body">
      <app-sidebar class="sidebar" />
      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.relative-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.layout-body {
  display: flex;
  flex: 1;
  margin-top: 60px;
}

.sidebar {
  width: 220px;
  background-color: #f5f6fa;
}

.main-content {
  flex: 1;
  padding: 2rem;
  background: #fff;
  overflow-y: auto;
}
</style>
