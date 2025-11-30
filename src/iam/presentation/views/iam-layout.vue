<script setup>
import LanguageSwitcher from '../../../shared/presentation/components/language-switcher.vue';
</script>

<template>
  <div class="auth-layout-container">
    <header class="auth-toolbar">
      <div class="toolbar-left">
        <span class="app-title">MediTrack</span>
      </div>
      <div class="toolbar-right">
        <div class="language-switcher-wrapper">
          <language-switcher />
        </div>
      </div>
    </header>

    <main class="auth-content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
:host {
    display: block;
    height: 100vh;
    overflow: hidden;
}

.auth-layout-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100%;
}

.auth-toolbar {
    background-color: #0C7BB5;
    color: white;
    height: 64px;
    padding: 0 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
}

.toolbar-left {
    display: flex;
    align-items: center;
    gap: 16px;
}

.toolbar-right {
    display: flex;
    align-items: center;
    gap: 16px;
}

.app-title {
    font-size: 1.4rem;
    font-weight: 500;
    color: white;
}

.language-switcher-wrapper {
    display: flex;
    align-items: center;
    justify-content: flex-end;
}

.auth-content {
    margin-top: 64px;
    height: calc(100vh - 64px);
    width: 100%;
    overflow: hidden;
    background-color: #0C7BB5;
    display: flex;
    align-items: stretch;
    justify-content: stretch;
    padding: 0;
}


.language-switcher-wrapper .pv-select-button {
  background-color: rgba(255,255,255,0.08);
  border-radius: 4px;
  padding: 4px;
}

</style>