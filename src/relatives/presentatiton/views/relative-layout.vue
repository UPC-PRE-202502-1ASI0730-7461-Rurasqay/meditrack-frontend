<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useRelativesStore } from '../../application/relatives.store.js';
import { useIAMStore } from '../../../iam/application/iam.store.js';
import LanguageSwitcher from '../../../shared/presentation/components/language-switcher.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const relativesStore = useRelativesStore();
const iamStore = useIAMStore();

const isSidebarVisible = ref(true);
const currentTime = ref('');
const relativeId = ref(null);

let timeInterval = null;

const selectedRelative = computed(() => relativesStore.relative);
const loading = computed(() => relativesStore.loading);

const navigationItems = computed(() => {
  if (!relativeId.value) return [];
  
  const planType = selectedRelative.value?.planType?.toLowerCase();
  
  const allItems = [
    { link: `/relative/${relativeId.value}/profile`, icon: 'pi pi-user', label: t('relatives.navigation.profile') },
    { link: `/relative/${relativeId.value}/statistics`, icon: 'pi pi-chart-bar', label: t('relatives.navigation.statistics') },
    { link: `/relative/${relativeId.value}/alerts`, icon: 'pi pi-bell', label: t('relatives.navigation.alerts') },
    { link: `/relative/${relativeId.value}/support`, icon: 'pi pi-headphones', label: t('relatives.navigation.support') }
  ];

  // Only premium users have access to Support
  if (planType === 'premium') {
    return allItems;
  } else {
    return allItems.filter(item => !item.label.includes('Support'));
  }
});

function updateTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  currentTime.value = `${hours}:${minutes}:${seconds}`;
}

function toggleSidebar() {
  isSidebarVisible.value = !isSidebarVisible.value;
}

function logout() {
  iamStore.logout();
  router.push('/auth/login');
}

onMounted(async () => {
  relativeId.value = route.params.id;
  
  if (relativeId.value) {
    console.log('[RelativeLayout] Loading relative for userId:', relativeId.value);
    await relativesStore.fetchRelativeByUserId(parseInt(relativeId.value));
  }
  
  // Update time every second
  updateTime();
  timeInterval = setInterval(updateTime, 1000);
});

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval);
  }
});

// Watch for route changes
watch(() => route.params.id, async (newId) => {
  if (newId && newId !== relativeId.value) {
    relativeId.value = newId;
    await relativesStore.fetchRelativeByUserId(parseInt(newId));
  }
});
</script>

<template>
  <div class="relative-layout">
    <!-- Header -->
    <div class="header-toolbar">
      <div class="header-left">
        <pv-button
          icon="pi pi-bars"
          @click="toggleSidebar"
          text
          rounded
          class="menu-button"
        />
        <span class="app-title">MediTrack</span>
      </div>
      <div class="header-right">
        <span class="current-time">{{ currentTime }}</span>
        <img src="/logo.png" alt="MediTrack Logo" class="app-logo" />
      </div>
    </div>

    <!-- Sidebar -->
    <pv-drawer v-model:visible="isSidebarVisible" :showCloseIcon="false" class="sidebar-custom">
      <nav class="nav-list">
        <router-link
          v-for="item in navigationItems"
          :key="item.link"
          :to="item.link"
          class="nav-item"
          active-class="active"
        >
          <i :class="item.icon"></i>
          <span>{{ item.label }}</span>
        </router-link>

        <a @click="logout" class="nav-item logout-button">
          <i class="pi pi-sign-out"></i>
          <span>{{ t('navigation.logout') }}</span>
        </a>
      </nav>

      <div class="language-switcher-container">
        <language-switcher />
      </div>
    </pv-drawer>

    <!-- Main Content -->
    <div class="main-container" :class="{ 'sidebar-open': isSidebarVisible }">
      <div v-if="loading" class="loading-container">
        <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
        <p>{{ t('common.loading') }}</p>
      </div>
      <router-view v-else></router-view>
    </div>
  </div>
</template>

<style scoped>
.relative-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  background: #f5f5f5;
}

/* Header */
.header-toolbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.menu-button {
  color: white !important;
}

.app-title {
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.current-time {
  font-size: 1.125rem;
  font-weight: 500;
  font-family: 'Courier New', monospace;
}

.app-logo {
  height: 40px;
  width: auto;
}

/* Sidebar */
.sidebar-custom {
  width: 280px !important;
  background: white;
  border-right: 1px solid #e0e0e0;
}

.nav-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  margin-top: 1rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1rem;
  border-radius: 8px;
  color: #666;
  text-decoration: none;
  transition: all 0.2s;
  cursor: pointer;
  font-size: 0.9375rem;
}

.nav-item i {
  font-size: 1.25rem;
  width: 24px;
}

.nav-item:hover {
  background: #f5f5f5;
  color: #667eea;
}

.nav-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.logout-button {
  margin-top: auto;
  color: #ef4444;
}

.logout-button:hover {
  background: #fee2e2;
  color: #dc2626;
}

.language-switcher-container {
  position: absolute;
  bottom: 1.5rem;
  left: 1rem;
  right: 1rem;
}

/* Main Content */
.main-container {
  margin-top: 64px;
  padding: 2rem;
  overflow-y: auto;
  flex: 1;
  transition: margin-left 0.3s;
}

.main-container.sidebar-open {
  margin-left: 0;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  gap: 1rem;
  color: #666;
}

/* Responsive */
@media (max-width: 768px) {
  .header-toolbar {
    padding: 0 1rem;
  }

  .app-title {
    font-size: 1.25rem;
  }

  .current-time {
    display: none;
  }

  .main-container {
    padding: 1rem;
  }
}
</style>
