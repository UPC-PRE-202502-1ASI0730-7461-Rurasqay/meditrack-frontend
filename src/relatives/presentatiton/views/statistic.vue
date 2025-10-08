<script setup>

import BloodPreasureComponent from "../components/blood-preasure-component.vue";
import HearRateComponent from "../components/hear-rate-component.vue";
import TemperatureRateComponent from "../components/temperature-rate-component.vue";
import {useRouter} from "vue-router";
import {useRelativesStore} from "../../application/relatives.store.js";
import {storeToRefs} from "pinia";
import {computed, onMounted, ref} from "vue";
import OxigenSaturationComponent from "../components/oxigen-saturation-component.vue";

const router = useRouter()
const store = useRelativesStore();

const { relative } = storeToRefs(store);
const { fetchRelativeData } = store;


const isLoading = ref(true)

const isPremium = computed(() => {
  return relative.value?.planType === 'premium';
});

const temperatureData = computed(() => {
  return relative.value?.seniorCitizen?.signalVitals?.temperature || [];
});

const hasTemperatureData = computed(() => {
  return temperatureData.value.length > 0 && isPremium.value;
});

onMounted(async () => {
  await fetchRelativeData()
  isLoading.value = false
  console.log("Blood Pressure Data:", relative.value?.seniorCitizen?.signalVitals?.bloodPressure)
})



</script>

<template>

  <BloodPreasureComponent
      v-if="relative?.seniorCitizen?.signalVitals?.bloodPressure"
      :blood-pressure="relative.seniorCitizen.signalVitals.bloodPressure"
  />

  <div v-else>
    Cargando datos de presión arterial...
  </div>

  <hr />

  <HearRateComponent
      v-if="relative?.seniorCitizen?.signalVitals?.heartRate"
      :heart-rate="relative.seniorCitizen.signalVitals.heartRate"
  />
  <div v-else>
    Cargando datos de frecuencia cardíaca...
  </div>

  <hr>

  <OxigenSaturationComponent
      v-if="relative?.seniorCitizen?.signalVitals?.oxygenLevel"
      :oxygen-level="relative.seniorCitizen.signalVitals.oxygenLevel"
  />
  <div v-else>
    Cargando datos de saturación de oxígeno...
  </div>

  <hr>

  <TemperatureRateComponent
      v-if="hasTemperatureData"
      :temperature="temperatureData"
      :is-premium="isPremium"
  />

  <!-- Mensaje para usuarios no premium -->
  <div v-else-if="!isPremium" class="p-4 text-center text-gray-500">
    <p>La funcionalidad de monitoreo de temperatura está disponible solo para usuarios Premium</p>
  </div>

  <div v-else>
    Cargando datos de temperatura...
  </div>
</template>

<style scoped>

</style>