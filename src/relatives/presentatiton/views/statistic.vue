<script setup>
import { useRelativesStore } from "../../application/relatives.store.js";
import { useDevicesStore } from '../../../devices/application/devices.store.js';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from "pinia";
import { computed, onMounted, ref } from "vue";
import BloodPressureChart from '../../../organization/presentation/components/blood-pressure-chart.vue';
import HeartRateChart from '../../../organization/presentation/components/heart-rate-chart.vue';
import OxygenSaturationChart from '../../../organization/presentation/components/oxygen-saturation-chart.vue';
import TemperatureChart from '../../../organization/presentation/components/temperature-chart.vue';

const { t } = useI18n();
const relativesStore = useRelativesStore();
const devicesStore = useDevicesStore();

const { relative, loading } = storeToRefs(relativesStore);

const isLoading = ref(true);

const isPremium = computed(() => {
  const planType = relative.value?.planType?.toLowerCase();
  return planType === 'premium';
});

const measurements = computed(() => devicesStore.measurements);

onMounted(async () => {
  try {
    const deviceId = relative.value?.seniorCitizen?.deviceId;
    if (deviceId && deviceId > 0) {
      await devicesStore.fetchAllMeasurements(deviceId);
    } else {
      console.warn('No valid device ID found for senior citizen');
    }
  } catch (error) {
    console.error('Error loading measurements:', error);
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
    <div v-if="loading || isLoading" class="loading-container">
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
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
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
  padding: 1rem;
}

.statistics-content :deep(.chart-container) {
  min-height: 400px;
  width: 100%;
}

.statistics-content :deep(canvas) {
  width: 100% !important;
  height: 400px !important;
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
</style>