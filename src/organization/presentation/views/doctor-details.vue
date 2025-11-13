<script setup>

import {useRoute, useRouter} from "vue-router";
import {useOrganizationStore} from "../../application/organization.store.js";
import {onMounted, ref} from "vue";
import {storeToRefs} from "pinia";
import useIAMStore from "../../../identity-access-managment/application/iam.store.js";
import {useI18n} from "vue-i18n";

const route = useRoute();
const router = useRouter();
const store = useOrganizationStore();
const iamStore = useIAMStore();
const {t} = useI18n();

const {currentUser} = storeToRefs(iamStore);
const {doctorsByOrganization, doctorsLoaded, organization, organizationsLoaded} = storeToRefs(store);
const {getDoctorsById, fetchDoctors, fetchOrganizationById} = store;

const doctor = ref(null);
const loading = ref(true);

onMounted(async () => {
  console.log('Doctor Details mounted');
  console.log('Doctor ID from route params:', route.params.id);
  
  // Ensure user is logged in
  if (!currentUser.value) {
    console.warn('No current user found, redirecting to login');
    router.push({name: 'login'});
    return;
  }
  
  // Ensure organization is loaded
  if (!organizationsLoaded.value || !organization.value) {
    console.log('Loading organization...');
    await fetchOrganizationById(currentUser.value.entityId);
  }
  
  // Ensure doctors are loaded
  if (!doctorsLoaded.value || doctorsByOrganization.value.length === 0) {
    console.log('Loading doctors...');
    await fetchDoctors();
  }
  
  console.log('All doctors:', doctorsByOrganization.value);
  
  const doctorsArray = getDoctorsById(route.params.id);
  console.log('Doctors found:', doctorsArray);
  
  if (doctorsArray && doctorsArray.length > 0) {
    doctor.value = doctorsArray[0];
    console.log('Selected doctor:', doctor.value);
  } else {
    console.warn('No doctor found with id:', route.params.id);
  }
  
  loading.value = false;
})

</script>

<template>
  <div class="p-4">
    <div v-if="loading" class="flex justify-content-center align-items-center" style="min-height: 300px;">
      <pv-progress-spinner />
    </div>
    <pv-card v-else-if="doctor" class="doctor-details-card">
      <template #header>
        <div class="card-header-custom">
          <i class="pi pi-user-md text-6xl text-primary"></i>
        </div>
      </template>
      <template #title>
        <h2 class="text-3xl font-bold text-primary">{{ doctor.fullName }}</h2>
      </template>
      <template #subtitle>
        <p class="text-xl text-600">{{ doctor.specialty }}</p>
      </template>
      <template #content>
        <div class="flex flex-column gap-3 mt-3">
          <div v-if="doctor.age" class="detail-row">
            <span class="detail-label">
              <i class="pi pi-calendar text-primary mr-2"></i>
              <strong>{{ t('organization.doctor-details.age') }}:</strong>
            </span>
            <span class="detail-value">{{ doctor.age }} {{ t('organization.doctor-details.years') }}</span>
          </div>
          <div v-if="doctor.email" class="detail-row">
            <span class="detail-label">
              <i class="pi pi-envelope text-primary mr-2"></i>
              <strong>{{ t('organization.doctor-details.email') }}:</strong>
            </span>
            <span class="detail-value">{{ doctor.email }}</span>
          </div>
          <div v-if="doctor.phoneNumber" class="detail-row">
            <span class="detail-label">
              <i class="pi pi-phone text-primary mr-2"></i>
              <strong>{{ t('organization.doctor-details.phone') }}:</strong>
            </span>
            <span class="detail-value">{{ doctor.phoneNumber }}</span>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-content-start">
          <pv-button 
            icon="pi pi-arrow-left" 
            :label="t('organization.doctor-details.back')"
            @click="router.push({name: 'organization-doctors'})" 
            class="p-button-outlined"
          />
        </div>
      </template>
    </pv-card>
    <pv-card v-else class="error-card">
      <template #content>
        <div class="flex flex-column align-items-center gap-3">
          <i class="pi pi-exclamation-triangle text-6xl text-red-500"></i>
          <p class="text-xl text-red-500">{{ t('organization.doctor-details.not-found', {id: route.params.id}) }}</p>
          <pv-button 
            icon="pi pi-arrow-left" 
            :label="t('organization.doctor-details.back')"
            @click="router.push({name: 'organization-doctors'})"
          />
        </div>
      </template>
    </pv-card>
  </div>

</template>

<style scoped>
.doctor-details-card {
  max-width: 800px;
  margin: 0 auto;
}

.card-header-custom {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.card-header-custom i {
  color: white;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-radius: 8px;
  background-color: #f8f9fa;
  transition: all 0.3s ease;
}

.detail-row:hover {
  background-color: #e9ecef;
  transform: translateX(5px);
}

.detail-label {
  display: flex;
  align-items: center;
  color: #495057;
}

.detail-value {
  color: #212529;
  font-weight: 500;
}

.error-card {
  max-width: 600px;
  margin: 2rem auto;
}
</style>