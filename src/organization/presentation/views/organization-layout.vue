<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useOrganizationStore } from '../../application/organization.store.js';
import { useIAMStore } from '../../../identity-access-managment/application/iam.store.js';
import LanguageSwitcher from '../../../shared/presentation/components/language-switcher.vue';
import { TimeApiService } from '../../../shared/infrastructure/time.service.js';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const organizationStore = useOrganizationStore();
const iamStore = useIAMStore();

// State
const sidebarVisible = ref(false);
const currentTime = ref('');
const isLoading = ref(true);
const isLoadingOrganization = ref(false);
const serverTimeOffset = ref(0); // Offset between server time and local time

// Services
const timeService = new TimeApiService();
let timeInterval = null;

// Computed properties
const organizationId = computed(() => route.params.organizationId);
const userId = computed(() => route.params.userId || iamStore.currentUser?.id);
const userRole = computed(() => route.params.userRole || iamStore.currentUser?.role);

// Get current organization
const currentOrganization = computed(() => {
  if (!organizationStore.organizations || !Array.isArray(organizationStore.organizations)) {
    return organizationStore.organization; // Fallback to single organization
  }
  return organizationStore.organizations.find(org => org.id === parseInt(organizationId.value));
});

const organizationType = computed(() => currentOrganization.value?.type || 'clinic');
const isClinic = computed(() => organizationType.value === 'clinic');
// Accept both 'resident' and 'residence' for backward compatibility
const isResidentHome = computed(() => 
  organizationType.value === 'resident' || organizationType.value === 'residence'
);

// Navigation items based on organization type and user role
const navigationItems = computed(() => {
  const baseItems = [];
  const role = userRole.value;
  
  // Check if user is an admin (organizationAdmin or admin)
  const isAdmin = role === 'organizationAdmin' || role === 'admin';
  
  if (isClinic.value) {
    // Clinic navigation
    if (isAdmin) {
      baseItems.push(
        { 
          label: t('doctor.title'), 
          icon: 'pi pi-users',
          to: `/organization/${organizationId.value}/doctors`
        },
        { 
          label: t('senior-citizen.title'), 
          icon: 'pi pi-user',
          to: `/organization/${organizationId.value}/senior-citizens`
        }
      );
    } else if (role === 'doctor') {
      baseItems.push(
        { 
          label: t('senior-citizen.myPatients'), 
          icon: 'pi pi-user',
          to: `/organization/${organizationId.value}/senior-citizens`
        }
      );
    }
  } else {
    // Resident home navigation
    if (isAdmin) {
      baseItems.push(
        { 
          label: t('caregiver.title'), 
          icon: 'pi pi-users',
          to: `/organization/${organizationId.value}/caregivers`
        },
        { 
          label: t('senior-citizen.title'), 
          icon: 'pi pi-user',
          to: `/organization/${organizationId.value}/senior-citizens`
        }
      );
    } else if (role === 'caregiver') {
      baseItems.push(
        { 
          label: t('senior-citizen.myPatients'), 
          icon: 'pi pi-user',
          to: `/organization/${organizationId.value}/senior-citizens`
        }
      );
    }
  }
  
  // Support is available for all roles
  baseItems.push({ 
    label: t('support.title'), 
    icon: 'pi pi-question-circle',
    to: `/organization/${organizationId.value}/support`
  });
  
  return baseItems;
});

// Time formatting
const formatDateTime = (datetime) => {
  const date = new Date(datetime);
  return date.toLocaleString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

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

// Load organization data
const loadOrganization = async () => {
  if (!organizationId.value) return;
  
  isLoadingOrganization.value = true;
  try {
    await organizationStore.fetchOrganizationById(parseInt(organizationId.value));
  } catch (error) {
    console.error('Error loading organization:', error);
  } finally {
    isLoadingOrganization.value = false;
  }
};

// Handle navigation
const navigateTo = (item) => {
  sidebarVisible.value = false;
  router.push(item.to);
};

// Handle logout
const logout = () => {
  iamStore.logout();
  router.push('/login');
};

// Lifecycle hooks
onMounted(async () => {
  // Fetch server time only once
  await fetchServerTime();
  // Update display every second using local clock + offset
  timeInterval = setInterval(updateLocalTime, 1000);
  await loadOrganization();
  
  // Auto-redirect if no specific route is matched
  if (route.name === 'organization' && organizationId.value) {
    const role = userRole.value;
    const isAdmin = role === 'organizationAdmin' || role === 'admin';
    
    if (isClinic.value && isAdmin) {
      router.push(`/organization/${organizationId.value}/doctors`);
    } else if (isResidentHome.value && isAdmin) {
      router.push(`/organization/${organizationId.value}/caregivers`);
    } else {
      router.push(`/organization/${organizationId.value}/senior-citizens`);
    }
  }
});

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval);
  }
});

// Watch for organization changes
watch(() => organizationId.value, (newId) => {
  if (newId) {
    loadOrganization();
  }
});
</script>

<template>
  <div class="organization-layout">
    <!-- Toolbar -->
    <pv-toolbar class="toolbar">
      <template #start>
        <div class="start-section">
          <pv-button 
            icon="pi pi-bars" 
            @click="sidebarVisible = true" 
            class="sidebar-button"
            severity="secondary"
            text
          />
          <p class="app-title">
            {{ currentOrganization?.name || 'MediTrack' }}
          </p>
          <pv-tag 
            v-if="currentOrganization" 
            :value="isClinic ? t('organization.clinic') : t('organization.residentHome')"
            :severity="isClinic ? 'info' : 'success'"
            class="org-type-badge"
          />
        </div>
      </template>
      <template #end>
        <div class="end-section">
          <div class="time-display">
            <span v-if="isLoading" class="loading-text">
              <i class="pi pi-spin pi-spinner"></i> {{ t('common.loading') }}...
            </span>
            <div v-else class="time-info">
              <span class="time">{{ currentTime }}</span>
            </div>
          </div>
          <div class="user-info">
            <i class="pi pi-user"></i>
            <span>{{ iamStore.currentUser?.username }}</span>
          </div>
          <pv-button 
            icon="pi pi-sign-out" 
            @click="logout"
            severity="danger"
            text
            :title="t('common.logout')"
          />
        </div>
      </template>
    </pv-toolbar>

    <!-- Sidebar -->
    <pv-drawer v-model:visible="sidebarVisible" class="organization-sidebar">
      <template #header>
        <div class="sidebar-header">
          <h3>{{ t('common.menu') }}</h3>
        </div>
      </template>
      
      <div class="sidebar-content">
        <!-- Navigation items -->
        <div class="menu-items">
          <div
            v-for="item in navigationItems"
            :key="item.to"
            class="menu-item"
            :class="{ 'active': $route.path.includes(item.to) }"
            @click="navigateTo(item)"
          >
            <i :class="item.icon"></i>
            <span>{{ item.label }}</span>
          </div>
        </div>

        <!-- Language switcher -->
        <div class="sidebar-footer">
          <language-switcher />
        </div>
      </div>
    </pv-drawer>

    <!-- Main content area -->
    <div class="content-area">
      <div v-if="isLoadingOrganization" class="loading-container">
        <pv-progress-spinner />
        <p>{{ t('common.loading') }}...</p>
      </div>
      <router-view v-else />
    </div>
  </div>
</template>

<style scoped>
.organization-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.toolbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem;
  background-color: #1976d2;
  color: white;
  font-size: medium;
  font-weight: bold;
  z-index: 1000;
  height: 60px;
  box-sizing: border-box;
}

.start-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.app-title {
  margin: 0;
  font-size: 1.2rem;
}

.org-type-badge {
  font-size: 0.75rem;
}

.sidebar-button {
  color: white !important;
}

.end-section {
  display: flex;
  align-items: center;
  gap: 1rem;
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
  gap: 0.5rem;
}

.time-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.time {
  font-size: larger;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
}

.content-area {
  margin-top: 60px;
  padding: 2rem;
  flex: 1;
  background-color: #f5f5f5;
  min-height: calc(100vh - 60px);
  color: #333;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .content-area {
    background-color: #1e1e1e;
    color: #e0e0e0;
  }
  
  .toolbar {
    background-color: #0d47a1;
  }
  
  /* Sidebar dark mode with :deep() to override PrimeVue styles */
  .organization-sidebar :deep(.p-drawer) {
    background-color: #2d2d2d;
    color: #e0e0e0;
  }
  
  .organization-sidebar :deep(.p-drawer-header) {
    background-color: #1e1e1e;
    border-bottom: 1px solid #424242;
  }
  
  .organization-sidebar :deep(.p-drawer-content) {
    background-color: #2d2d2d;
  }
  
  .sidebar-header {
    background-color: #1e1e1e !important;
  }
  
  .sidebar-header h3 {
    color: #e0e0e0 !important;
  }
  
  .sidebar-content {
    background-color: #2d2d2d !important;
  }
  
  .menu-item {
    color: #e0e0e0 !important;
  }
  
  .menu-item:hover {
    background-color: #3d3d3d !important;
  }
  
  .menu-item.active {
    background-color: #1a237e !important;
    color: #64b5f6 !important;
  }
  
  .sidebar-footer {
    background-color: #2d2d2d !important;
    border-top: 1px solid #424242;
  }
  
  .loading-container {
    color: #e0e0e0;
  }
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
}

/* Sidebar styles */
.organization-sidebar {
  width: 280px;
}

.sidebar-header {
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
}

.sidebar-header h3 {
  margin: 0;
  color: #474747;
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.menu-items {
  flex: 1;
  padding: 1rem 0;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  cursor: pointer;
  transition: all 0.3s;
  color: #495057;
  border-left: 3px solid transparent;
}

.menu-item:hover {
  background-color: #f8f9fa;
  border-left-color: #1976d2;
}

.menu-item.active {
  background-color: #e3f2fd;
  border-left-color: #1976d2;
  color: #1976d2;
  font-weight: 600;
}

.menu-item i {
  font-size: 1.2rem;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid #dee2e6;
  margin-top: auto;
}
</style>
