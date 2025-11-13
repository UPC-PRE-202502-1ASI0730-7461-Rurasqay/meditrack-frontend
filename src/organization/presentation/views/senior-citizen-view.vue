<script setup>
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { computed, ref, watch } from 'vue';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const organizationId = computed(() => route.params.organizationId);
const userRole = computed(() => route.params.userRole);
const userId = computed(() => route.params.userId);
const seniorCitizenId = computed(() => route.params.id);

const tabs = [
  { label: 'details', icon: 'pi pi-user', route: 'details' },
  { label: 'alerts', icon: 'pi pi-bell', route: 'alerts' },
  { label: 'statistics', icon: 'pi pi-chart-bar', route: 'statistics' }
];

const activeIndex = ref(0);

// Determinar el índice activo basado en la ruta actual
const updateActiveIndex = () => {
  const currentPath = route.path;
  if (currentPath.includes('/alerts')) {
    activeIndex.value = 1;
  } else if (currentPath.includes('/statistics')) {
    activeIndex.value = 2;
  } else {
    activeIndex.value = 0;
  }
};

// Actualizar cuando cambia la ruta
watch(() => route.path, updateActiveIndex, { immediate: true });

const onTabChange = (event) => {
  const selectedTab = tabs[event.index];
  router.push(`/organization/${organizationId.value}/${userRole.value}/${userId.value}/senior-citizens/${seniorCitizenId.value}/${selectedTab.route}`);
};

const goBack = () => {
  router.push(`/organization/${organizationId.value}/${userRole.value}/${userId.value}/senior-citizens`);
};
</script>

<template>
  <div class="senior-citizen-view">
    <div class="header-actions">
      <pv-button 
        :label="t('caregiver.backToList')" 
        icon="pi pi-arrow-left" 
        @click="goBack" 
        text
        class="back-button"
      />
    </div>
    
    <div class="tabs-container">
      <pv-tab-view :active-index="activeIndex" @tab-change="onTabChange">
        <pv-tab-panel>
          <template #header>
            <i class="pi pi-user"></i>
            <span class="tab-label">{{ t('senior-citizen.details') }}</span>
          </template>
        </pv-tab-panel>
        
        <pv-tab-panel>
          <template #header>
            <i class="pi pi-bell"></i>
            <span class="tab-label">{{ t('senior-citizen.alerts') }}</span>
          </template>
        </pv-tab-panel>
        
        <pv-tab-panel>
          <template #header>
            <i class="pi pi-chart-bar"></i>
            <span class="tab-label">{{ t('senior-citizen.statistics') }}</span>
          </template>
        </pv-tab-panel>
      </pv-tab-view>
    </div>
    
    <div class="content-area">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.senior-citizen-view {
  padding: 1rem;
  min-height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}

.header-actions {
  margin-bottom: 1rem;
  flex-shrink: 0;
}

.back-button {
  font-weight: 600;
}

.tabs-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
  padding: 1rem;
  flex-shrink: 0;
}

.tab-label {
  margin-left: 0.5rem;
}

.content-area {
  margin-top: 1rem;
  flex: 1;
  min-height: 500px;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .tabs-container {
    background: #2d2d2d;
  }
}
</style>
