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
  <div class="alert-list-container p-4 flex flex-column gap-4">
    <div v-if="isLoading" class="loading-container">
      <pv-progress-spinner />
      <p>{{ t('common.loading') }}...</p>
    </div>
    <div v-else-if="alerts.length" class="alerts-grid">
      <pv-card
        v-for="alert in alerts"
        :key="alert.id"
        class="alert-card shadow-2 border-round-xl border-left-4 border-orange-500"
      >
        <template #content>
          <div class="alert-content">
            <h3 class="alert-title">{{ alert.alertTitle }}</h3>

            <div class="grid alert-grid">
              <div class="col-6">
                <span class="label">{{ t('senior-citizen.alertsTab.date') }}: </span>
                <span class="value">{{ formatDate(alert.date) }}</span>
              </div>
              <div class="col-6">
                <span class="label">{{ t('senior-citizen.alertsTab.time') }}: </span>
                <span class="value">{{ alert.time }}</span>
              </div>
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
        </template>
      </pv-card>
    </div>
    <div v-else class="text-center text-600">
      <i class="pi pi-bell" style="font-size: 3rem;"></i>
      <p>{{ t('senior-citizen.alertsTab.noAlerts') }}</p>
    </div>
  </div>
</template>

<style scoped>
.alert-list-container {
  min-height: 400px;
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
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.alert-content {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  text-align: left;
  height: 100%;
}

.alert-title {
  margin: 0;
  padding: 0;
  font-weight: bold;
  color: #f97316;
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.alert-grid {
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.alert-row {
  margin-bottom: 0.75rem;
}

.label {
  font-weight: 600;
  color: #495057;
  margin-right: 0.25rem;
}

.value {
  font-weight: 500;
  color: #6c757d;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .alert-title {
    color: #fb923c;
  }
  
  .label {
    color: #e0e0e0;
  }
  
  .value {
    color: #b0b0b0;
  }
}
</style>
