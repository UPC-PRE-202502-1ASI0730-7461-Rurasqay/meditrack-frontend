<script setup>
import { useRelativesStore } from "../../application/relatives.store.js";
import { computed, watch } from "vue";
import { storeToRefs } from "pinia";

const store = useRelativesStore();
const { relative } = storeToRefs(store);

const loading = computed(() => store.loading);
const error = computed(() => store.errors.length > 0 ? store.errors[store.errors.length - 1] : null);

</script>

<template>
  <div v-if="loading" class="loading-container">
    <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
    <p>Loading profile...</p>
  </div>
  <div v-else-if="error" class="error-container">
    <p>Error loading profile: {{ error.message || error }}</p>
  </div>
  <div v-else-if="relative && relative.seniorCitizen" class="profile-container p-4 text-black-alpha-90">
    <pv-panel header="Patient Profile">
      <div class="grid justify-content-center">
        <div class="col-12 flex justify-content-center mb-4">
          <img
              v-if="relative.seniorCitizen.imageUrl"
              :src="relative.seniorCitizen.imageUrl"
              :alt="`${relative.seniorCitizen.firstName} ${relative.seniorCitizen.lastName}`"
              class="profile-image"
          />
          <div v-else class="profile-image-placeholder">
            <i class="pi pi-user" style="font-size: 4rem"></i>
          </div>
        </div>

        <div class="col-12 text-center mb-5">
          <h2 class="text-black-alpha-90">
            {{ relative.seniorCitizen.firstName }} {{ relative.seniorCitizen.lastName }}
          </h2>
        </div>

        <div class="col-12 md:col-6">
          <ul class="p-listbox p-component">
            <li class="p-listbox-item profile-item">
              <div class="flex align-items-center gap-3">
                <span><strong>Age:</strong> {{ relative.seniorCitizen.age }}</span>
              </div>
            </li>
            <li class="p-listbox-item profile-item">
              <div class="flex align-items-center gap-3">
                <span><strong>Weight:</strong> {{ relative.seniorCitizen.weight }}kg</span>
              </div>
            </li>
            <li class="p-listbox-item profile-item">
              <div class="flex align-items-center gap-3">
                <span><strong>DNI:</strong> {{ relative.seniorCitizen.dni }}</span>
              </div>
            </li>
          </ul>
        </div>

        <div class="col-12 md:col-6">
          <ul class="p-listbox p-component">
            <li class="p-listbox-item profile-item">
              <div class="flex align-items-center gap-3">
                <span><strong>Gender:</strong> {{ relative.seniorCitizen.gender }}</span>
              </div>
            </li>
            <li class="p-listbox-item profile-item">
              <div class="flex align-items-center gap-3">
                <span><strong>Height:</strong> {{ relative.seniorCitizen.height }}cm</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </pv-panel>
  </div>
  <div v-else class="loading-container">
    <p>No patient data available.</p>
  </div>
</template>

<style scoped>
.profile-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.profile-image {
  width: 12rem;
  height: 12rem;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  object-fit: cover;
}

.profile-image-placeholder {
  width: 12rem;
  height: 12rem;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}

.profile-item {
  margin-bottom: 1rem;
}

.pv-list {
  padding: 0.5rem 0;
}

h2 {
  margin-bottom: 1.5rem;
}
</style>