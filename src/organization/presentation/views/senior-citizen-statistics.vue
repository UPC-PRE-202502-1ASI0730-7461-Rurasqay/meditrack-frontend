<script setup>
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useOrganizationStore } from '../../application/organization.store.js';
import { useDevicesStore } from '../../../devices/application/devices.store.js';
import { onMounted, computed, ref } from 'vue';
import BloodPressureChart from '../components/blood-pressure-chart.vue';
import HeartRateChart from '../components/heart-rate-chart.vue';
import OxygenSaturationChart from '../components/oxygen-saturation-chart.vue';
import TemperatureChart from '../components/temperature-chart.vue';

const route = useRoute();
const { t } = useI18n();
const organizationStore = useOrganizationStore();
const devicesStore = useDevicesStore();

const isLoading = ref(true);
const seniorCitizenId = computed(() => parseInt(route.params.id));

const seniorCitizen = computed(() => organizationStore.currentSeniorCitizen);
const isPremium = computed(() => {
  const planType = seniorCitizen.value?.planType?.toLowerCase();
  return planType === 'premium';
});

const measurements = computed(() => devicesStore.measurements);

onMounted(async () => {
  try {
    await organizationStore.fetchSeniorCitizenById(seniorCitizenId.value);
    const deviceId = seniorCitizen.value?.deviceId;
    if (deviceId && deviceId > 0) {
      await devicesStore.fetchAllMeasurements(deviceId);
    } else {
      console.warn('No valid device ID found for senior citizen');
    }
  } catch (error) {
    console.error('Error loading senior citizen statistics:', error);
  } finally {
    isLoading.value = false;
  }
});

const hasBloodPressureData = computed(() => {
  return measurements.value?.bloodPressure && measurements.value.bloodPressure.length > 0;
});

const hasHeartRateData = computed(() => {
  return measurements.value?.heartRate && measurements.value.heartRate.length > 0;
});

const hasOxygenLevelData = computed(() => {
  return measurements.value?.oxygen && measurements.value.oxygen.length > 0;
});

const hasTemperatureData = computed(() => {
  return measurements.value?.temperature && measurements.value.temperature.length > 0;
});

const temperatureData = computed(() => {
  return measurements.value?.temperature || [];
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
      <BloodPressureChart 
        v-if="hasBloodPressureData" 
        :blood-pressure="measurements.bloodPressure" 
      />
      <div v-else class="stat-placeholder">
        <i class="pi pi-heart"></i>
        <p>{{ t('senior-citizen.statisticsTab.noBloodPressure') }}</p>
      </div>

      <hr v-if="hasBloodPressureData || hasHeartRateData" />

      <!-- Heart Rate -->
      <HeartRateChart 
        v-if="hasHeartRateData" 
        :heart-rate="measurements.heartRate" 
      />
      <div v-else class="stat-placeholder">
        <i class="pi pi-pulse"></i>
        <p>{{ t('senior-citizen.statisticsTab.noHeartRate') }}</p>
      </div>

      <hr v-if="hasHeartRateData || hasOxygenLevelData" />

      <!-- Oxygen Level -->
      <OxygenSaturationChart 
        v-if="hasOxygenLevelData" 
        :oxygen-level="measurements.oxygen" 
      />
      <div v-else class="stat-placeholder">
        <i class="pi pi-circle"></i>
        <p>{{ t('senior-citizen.statisticsTab.noOxygenLevel') }}</p>
      </div>

      <hr />

      <!-- Temperature (Premium only) -->
      <div v-if="isPremium">
        <TemperatureChart 
          v-if="hasTemperatureData" 
          :temperature="temperatureData" 
          :is-premium="isPremium" 
        />
        <div v-else class="stat-placeholder">
          <i class="pi pi-sun"></i>
          <p>{{ t('senior-citizen.statisticsTab.noTemperature') }}</p>
        </div>
      </div>
      <div v-else class="stat-placeholder premium">
        <i class="pi pi-sun"></i>
        <p>{{ t('senior-citizen.statisticsTab.temperaturePremiumOnly') }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.statistics-container {
  padding: 0;
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
  gap: 1rem;
}

hr {
  margin: 1rem 0;
  border: none;
  border-top: 1px solid #dee2e6;
}

.stat-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  gap: 0.75rem;
  margin: 1rem;
}

.stat-placeholder i {
  font-size: 2.5rem;
  color: #6c757d;
}

.stat-placeholder p {
  color: #6c757d;
  margin: 0;
  text-align: center;
}

.stat-placeholder.premium {
  background-color: #fff3cd;
  border: 2px solid #f59e0b;
}

.stat-placeholder.premium i,
.stat-placeholder.premium p {
  color: #f59e0b;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  hr {
    border-top-color: #424242;
  }
  
  .stat-placeholder {
    background-color: #2d2d2d;
  }
  
  .stat-placeholder i,
  .stat-placeholder p {
    color: #b0b0b0;
  }
  
  .stat-placeholder.premium {
    background-color: #3d2f00;
    border-color: #fbbf24;
  }
  
  .stat-placeholder.premium i,
  .stat-placeholder.premium p {
    color: #fbbf24;
  }
}
</style>
