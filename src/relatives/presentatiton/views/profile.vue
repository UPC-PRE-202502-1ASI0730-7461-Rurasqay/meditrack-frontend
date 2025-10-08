<script setup>
import {useRouter} from "vue-router";
import {useRelativesStore} from "../../application/relatives.store.js";
import {computed, onMounted, watch} from "vue";
import {storeToRefs} from "pinia";
import {Card as PvCard} from "primevue";

const router = useRouter()
const store = useRelativesStore();

const { relative, errors } = storeToRefs(store);
const { fetchRelativeData } = store;

onMounted(() => {
  fetchRelativeData()
})

</script>

<template>
  <div v-if="relative && relative.seniorCitizen" class="profile-container p-4 text-black-alpha-90">
    <pv-panel header="Patient Profile" toggleable>
      <template #icons>
        <button class="p-panel-header-icon p-link mr-2">
          <i class="pi pi-cog"></i>
        </button>
      </template>

      <div class="grid justify-content-center">
        <div class="col-12 flex justify-content-center mb-4">
          <img
              v-if="relative.seniorCitizen.image"
              :src="relative.seniorCitizen.image"
              class="profile-image"
          />
        </div>

        <div class="col-12 text-center mb-5">
          <h2 class="text-black-alpha-90">
            {{ relative.seniorCitizen.firstName }} {{ relative.seniorCitizen.lastName }}
          </h2>
        </div>

        <div class="col-12 md:col-6">
          <pv-list>
            <pv-list-item class="profile-item">
              <div class="flex align-items-center gap-3">
                <span><strong>Age:</strong> {{ relative.seniorCitizen.age }}</span>
              </div>
            </pv-list-item>
            <pv-list-item class="profile-item">
              <div class="flex align-items-center gap-3">
                <span><strong>Weight:</strong> {{ relative.seniorCitizen.weight }}kg</span>
              </div>
            </pv-list-item>
            <pv-list-item class="profile-item">
              <div class="flex align-items-center gap-3">
                <span><strong>DNI:</strong> {{ relative.seniorCitizen.dni }}</span>
              </div>
            </pv-list-item>
          </pv-list>
        </div>

        <div class="col-12 md:col-6">
          <pv-list>
            <pv-list-item class="profile-item">
              <div class="flex align-items-center gap-3">
                <span><strong>Gender:</strong> {{ relative.seniorCitizen.gender }}</span>
              </div>
            </pv-list-item>
            <pv-list-item class="profile-item">
              <div class="flex align-items-center gap-3">
                <span><strong>Height:</strong> {{ relative.seniorCitizen.height }}cm</span>
              </div>
            </pv-list-item>
          </pv-list>
        </div>
      </div>
    </pv-panel>
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