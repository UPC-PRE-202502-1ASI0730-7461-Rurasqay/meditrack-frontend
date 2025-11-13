<script setup>
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useOrganizationStore } from '../../application/organization.store.js';
import { onMounted, computed, ref } from 'vue';

const route = useRoute();
const { t } = useI18n();
const organizationStore = useOrganizationStore();

const isLoading = ref(true);
const seniorCitizenId = computed(() => parseInt(route.params.id));

const seniorCitizen = computed(() => organizationStore.currentSeniorCitizen);
const alerts = computed(() => seniorCitizen.value?.alerts || []);

onMounted(async () => {
  try {
    await organizationStore.fetchSeniorCitizenById(seniorCitizenId.value);
  } catch (error) {
    console.error('Error loading senior citizen alerts:', error);
  } finally {
    isLoading.value = false;
  }
});

const formatDate = (date) => new Date(date).toLocaleDateString();
</script>

<template>
  <div class="alert-list-container">
    <div v-if="isLoading" class="loading-container">
      <pv-progress-spinner />
      <p>{{ t('common.loading') }}...</p>
    </div>
    <div v-else-if="alerts.length" class="alerts-grid">
      <pv-card
        v-for="alert in alerts"
        :key="alert.id"
        class="alert-card"
      >
        <template #content>
          <div class="alert-content">
            <h3 class="alert-title">{{ alert.alertTitle }}</h3>

            <div class="alert-details">
              <div class="alert-row">
                <span class="label">{{ t('senior-citizen.alertsTab.date') }}: </span>
                <span class="value">{{ formatDate(alert.date) }}</span>
              </div>
              <div class="alert-row">
                <span class="label">{{ t('senior-citizen.alertsTab.time') }}: </span>
                <span class="value">{{ alert.time }}</span>
              </div>
              <div class="alert-row">
                <span class="label">{{ t('senior-citizen.alertsTab.dataRegistered') }}: </span>
                <span class="value">{{ alert.dataRegistered }}</span>
              </div>
              <div class="alert-row">
                <span class="label">{{ t('senior-citizen.alertsTab.reason') }}: </span>
                <span class="value">{{ alert.reason }}</span>
              </div>
            </div>
          </div>
        </template>
      </pv-card>
    </div>
    <div v-else class="empty-state">
      <i class="pi pi-bell" style="font-size: 3rem; color: #6c757d;"></i>
      <p>{{ t('senior-citizen.alertsTab.noAlerts') }}</p>
    </div>
  </div>
</template>

<style scoped>
.alert-list-container {
  padding: 1rem;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
}

.alerts-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.alert-card {
  border-left: 4px solid #f97316;
}

.alert-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.alert-title {
  margin: 0;
  font-weight: 600;
  color: #1976d2;
  font-size: 1.2rem;
}

.alert-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.alert-row {
  display: flex;
  align-items: center;
}

.label {
  font-weight: 600;
  color: #495057;
  margin-right: 0.5rem;
}

.value {
  color: #6c757d;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  gap: 1rem;
}

.empty-state p {
  color: #6c757d;
  font-size: 1.1rem;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .alert-title {
    color: #64b5f6;
  }
  
  .label {
    color: #e0e0e0;
  }
  
  .value {
    color: #b0b0b0;
  }
  
  .empty-state p {
    color: #b0b0b0;
  }
}
</style>
