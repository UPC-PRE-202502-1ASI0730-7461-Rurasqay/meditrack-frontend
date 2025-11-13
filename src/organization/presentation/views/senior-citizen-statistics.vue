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
const signalVitals = computed(() => seniorCitizen.value?.signalVitals || {});
const isPremium = computed(() => seniorCitizen.value?.planType === 'premium');

onMounted(async () => {
  try {
    await organizationStore.fetchSeniorCitizenById(seniorCitizenId.value);
  } catch (error) {
    console.error('Error loading senior citizen statistics:', error);
  } finally {
    isLoading.value = false;
  }
});

const hasBloodPressureData = computed(() => {
  return signalVitals.value?.bloodPressure && signalVitals.value.bloodPressure.length > 0;
});

const hasHeartRateData = computed(() => {
  return signalVitals.value?.heartRate && signalVitals.value.heartRate.length > 0;
});

const hasOxygenLevelData = computed(() => {
  return signalVitals.value?.oxygenLevel && signalVitals.value.oxygenLevel.length > 0;
});

const hasTemperatureData = computed(() => {
  return signalVitals.value?.temperature && signalVitals.value.temperature.length > 0 && isPremium.value;
});
</script>

<template>
  <div class="statistics-container">
    <div v-if="isLoading" class="loading-container">
      <pv-progress-spinner />
      <p>{{ t('common.loading') }}...</p>
    </div>
    <div v-else class="statistics-content">
      <!-- Blood Pressure -->
      <pv-card v-if="hasBloodPressureData" class="stat-card">
        <template #title>
          <div class="stat-title">
            <i class="pi pi-heart"></i>
            <span>{{ t('senior-citizen.statisticsTab.bloodPressure') }}</span>
          </div>
        </template>
        <template #content>
          <div class="stat-data">
            <p>{{ t('senior-citizen.statisticsTab.dataAvailable') }}</p>
            <!-- Aquí puedes agregar el componente de gráfica -->
          </div>
        </template>
      </pv-card>
      <div v-else class="stat-placeholder">
        <i class="pi pi-heart"></i>
        <p>{{ t('senior-citizen.statisticsTab.noBloodPressure') }}</p>
      </div>

      <!-- Heart Rate -->
      <pv-card v-if="hasHeartRateData" class="stat-card">
        <template #title>
          <div class="stat-title">
            <i class="pi pi-pulse"></i>
            <span>{{ t('senior-citizen.statisticsTab.heartRate') }}</span>
          </div>
        </template>
        <template #content>
          <div class="stat-data">
            <p>{{ t('senior-citizen.statisticsTab.dataAvailable') }}</p>
            <!-- Aquí puedes agregar el componente de gráfica -->
          </div>
        </template>
      </pv-card>
      <div v-else class="stat-placeholder">
        <i class="pi pi-pulse"></i>
        <p>{{ t('senior-citizen.statisticsTab.noHeartRate') }}</p>
      </div>

      <!-- Oxygen Level -->
      <pv-card v-if="hasOxygenLevelData" class="stat-card">
        <template #title>
          <div class="stat-title">
            <i class="pi pi-circle"></i>
            <span>{{ t('senior-citizen.statisticsTab.oxygenLevel') }}</span>
          </div>
        </template>
        <template #content>
          <div class="stat-data">
            <p>{{ t('senior-citizen.statisticsTab.dataAvailable') }}</p>
            <!-- Aquí puedes agregar el componente de gráfica -->
          </div>
        </template>
      </pv-card>
      <div v-else class="stat-placeholder">
        <i class="pi pi-circle"></i>
        <p>{{ t('senior-citizen.statisticsTab.noOxygenLevel') }}</p>
      </div>

      <!-- Temperature (Premium only) -->
      <pv-card v-if="hasTemperatureData" class="stat-card">
        <template #title>
          <div class="stat-title">
            <i class="pi pi-sun"></i>
            <span>{{ t('senior-citizen.statisticsTab.temperature') }}</span>
            <pv-tag value="Premium" severity="warning" />
          </div>
        </template>
        <template #content>
          <div class="stat-data">
            <p>{{ t('senior-citizen.statisticsTab.dataAvailable') }}</p>
            <!-- Aquí puedes agregar el componente de gráfica -->
          </div>
        </template>
      </pv-card>
      <div v-else-if="!isPremium" class="stat-placeholder premium">
        <i class="pi pi-sun"></i>
        <p>{{ t('senior-citizen.statisticsTab.temperaturePremiumOnly') }}</p>
      </div>
      <div v-else class="stat-placeholder">
        <i class="pi pi-sun"></i>
        <p>{{ t('senior-citizen.statisticsTab.noTemperature') }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.statistics-container {
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

.statistics-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.stat-card {
  border-left: 4px solid #1976d2;
}

.stat-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.2rem;
  font-weight: 600;
  color: #1976d2;
}

.stat-title i {
  font-size: 1.5rem;
}

.stat-data {
  padding: 1rem 0;
}

.stat-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #6c757d;
  gap: 0.75rem;
}

.stat-placeholder i {
  font-size: 2rem;
  color: #6c757d;
}

.stat-placeholder p {
  color: #6c757d;
  margin: 0;
}

.stat-placeholder.premium {
  border-left-color: #f59e0b;
}

.stat-placeholder.premium i,
.stat-placeholder.premium p {
  color: #f59e0b;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .stat-title {
    color: #64b5f6;
  }
  
  .stat-placeholder {
    background-color: #2d2d2d;
    border-left-color: #b0b0b0;
  }
  
  .stat-placeholder i,
  .stat-placeholder p {
    color: #b0b0b0;
  }
  
  .stat-placeholder.premium {
    border-left-color: #fbbf24;
  }
  
  .stat-placeholder.premium i,
  .stat-placeholder.premium p {
    color: #fbbf24;
  }
}
</style>
