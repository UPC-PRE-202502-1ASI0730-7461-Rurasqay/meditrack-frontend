<script setup lang="ts">

import AppSidebar from "./app-sidebar.vue";
import {ref, onMounted, onUnmounted} from "vue";
import { TimeApiService } from "../../infrastructure/time.service.js";

const visible = ref(false);
const currentTime = ref('');
const isLoading = ref(true);
const serverTimeOffset = ref(0);

const timeService = new TimeApiService();
let timeInterval = null;

// Fetch server time only once and calculate offset
const fetchServerTime = async () => {
  // Check if we already have a cached offset in sessionStorage
  const cachedOffset = sessionStorage.getItem('serverTimeOffset');
  
  if (cachedOffset !== null) {
    // Use cached offset
    serverTimeOffset.value = parseInt(cachedOffset);
    updateLocalTime();
    isLoading.value = false;
    return;
  }
  
  try {
    const localTime = Date.now();
    const response = await timeService.getTime();
    const data = response.data;
    const serverTime = new Date(data.datetime).getTime();
    
    // Calculate offset between server time and local time
    serverTimeOffset.value = serverTime - localTime;
    
    // Cache the offset for this session
    sessionStorage.setItem('serverTimeOffset', serverTimeOffset.value.toString());
    
    updateLocalTime();
    isLoading.value = false;
  } catch (error) {
    // Don't log the full error to avoid console spam
    if (error.response?.status === 429) {
      console.warn('Time API rate limit reached, using local time');
    } else {
      console.warn('Could not fetch server time, using local time');
    }
    
    // Use local time if server fails
    serverTimeOffset.value = 0;
    sessionStorage.setItem('serverTimeOffset', '0');
    updateLocalTime();
    isLoading.value = false;
  }
};

// Update time using local clock + offset
const updateLocalTime = () => {
  const adjustedTime = new Date(Date.now() + serverTimeOffset.value);
  currentTime.value = adjustedTime.toLocaleString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

// Inicializar cuando el componente se monta
onMounted(async () => {
  // Fetch server time only once
  await fetchServerTime();
  // Update display every second using local clock + offset
  timeInterval = setInterval(updateLocalTime, 1000);
});

// Limpiar interval cuando el componente se desmonta
onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval);
  }
});
</script>

<template>
  <pv-toolbar class="toolbar">
    <template #start>
      <div class="start-section">
        <app-sidebar v-model:visible="visible"></app-sidebar>
        <pv-button icon="pi pi-bars" @click="visible = true" class="sidebar-button"/>
        <p class="app-title">Meditrack</p>
      </div>
    </template>
    <template #end>
      <div class="end-section">
        <div class="time-display">
          <span v-if="isLoading" class="loading-text">
            <i class="pi pi-spin pi-spinner"></i> Cargando hora...
          </span>
          <div v-else class="time-info">
            <span class="time">{{ currentTime }}</span>
          </div>
        </div>
        <img src="../../../assets/logo1.png" alt="Logo" height="40" class="logo" />
      </div>
    </template>
  </pv-toolbar>
</template>

<style scoped>
.toolbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem;
  background-color: #1976d2; /* Color de fondo */
  color: white; /* Color del texto */
  font-size: medium;
  font-weight: bold;
  z-index: 1000;
  height: 60px;
  box-sizing: border-box;
}

.start-section {
  display: flex;
  align-items: center;
}

.app-title {
  margin-left: 0.5rem;
}

.sidebar-button {
  background-color: transparent !important;
  border: none !important;
  color: white;
}

.sidebar-button:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
  border: none !important;
}

.sidebar-button:focus {
  background-color: rgba(255, 255, 255, 0.2) !important;
  border: none !important;
}

.end-section {
  display: flex;
  align-items: center;
}

.time-display {
  color: white;
  font-size: medium;
  font-weight: bold;
  display: flex;
  align-items: center;
}

.loading-text {
  display: flex;
  align-items: center;
}

.pi-spinner {
  margin-right: 0.5rem;
}

.time-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.time {
  font-size: larger;
}

.timezone {
  font-size: small;
}

.logo {
  margin-left: 1rem;
}
</style>