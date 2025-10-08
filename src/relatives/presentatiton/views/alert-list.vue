<script setup>

import {useRelativesStore} from "../../application/relatives.store.js";
import {storeToRefs} from "pinia";
import {onMounted} from "vue";

const store = useRelativesStore()
const { relative } = storeToRefs(store)
const { fetchRelativeData } = store

onMounted(() => {
  fetchRelativeData()
})

const formatDate = (date) => new Date(date).toLocaleDateString()

</script>

<template>
  <div class="p-4 flex flex-column gap-4">
    <div v-if="relative?.seniorCitizen?.alerts?.length" class="alerts-grid">
      <pv-card
          v-for="alert in relative.seniorCitizen.alerts"
          :key="alert.id"
          class="alert-card shadow-2 border-round-xl border-left-4 border-orange-500"
      >
        <template #content>
          <div class="alert-content">
            <h3 class="alert-title">{{ alert.alertTitle }}</h3>

            <div class="grid alert-grid">
              <div class="col-6">
                <span class="label">Date: </span>
                <span class="value">{{ formatDate(alert.date) }}</span>
              </div>
              <div class="col-6">
                <span class="label">Time: </span>
                <span class="value">{{ alert.time }}</span>
              </div>
            </div>

            <div class="alert-row">
              <span class="label">Data Registered: </span>
              <span class="value">{{ alert.dataRegistered }}</span>
            </div>

            <div class="alert-row">
              <span class="label">Reason: </span>
              <span class="value">{{ alert.reason }}</span>
            </div>
          </div>
        </template>
      </pv-card>
    </div>
    <div v-else class="text-center text-600">No alerts available.</div>
  </div>
</template>

<style scoped>
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
  color: #ffffff;
}


.alert-grid {
  gap: 0.5rem;
  margin-bottom: 1rem;
}


.label {
  font-weight: 600;
  color: #ffffff;
  margin-right: 0.25rem;
}

.value {
  font-weight: 500;
  color: #ffffff;
}

.alerts-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>