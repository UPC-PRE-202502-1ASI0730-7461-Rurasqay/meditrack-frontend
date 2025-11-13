<script setup>

import {useRoute, useRouter} from "vue-router";
import {useOrganizationStore} from "../../application/organization.store.js";
import {onMounted, ref} from "vue";
import {storeToRefs} from "pinia";
import useIAMStore from "../../../identity-access-managment/application/iam.store.js";

const route = useRoute();
const router = useRouter();
const store = useOrganizationStore();
const iamStore = useIAMStore();

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
    <div v-if="loading">
      <p>Loading doctor details...</p>
    </div>
    <div v-else-if="doctor">
      <h2 class="text-3xl font-bold mb-3">{{ doctor.fullName }}</h2>
      <p class="text-xl mb-2"><strong>Specialty:</strong> {{ doctor.specialty }}</p>
      <p v-if="doctor.email" class="mb-2"><strong>Email:</strong> {{ doctor.email }}</p>
      <p v-if="doctor.phone" class="mb-2"><strong>Phone:</strong> {{ doctor.phone }}</p>
      <hr class="solid my-4">
      <button @click="router.push({name: 'organization-doctors'})" class="bg-blue-600 text-white px-4 py-2 rounded">
        Back to Doctors List
      </button>
    </div>
    <div v-else>
      <p class="text-red-500">Doctor not found with ID: {{ route.params.id }}</p>
      <button @click="router.push({name: 'organization-doctors'})" class="bg-blue-600 text-white px-4 py-2 rounded mt-3">
        Back to Doctors List
      </button>
    </div>
  </div>

</template>

<style scoped>
hr.solid{
  border-top: 3px solid #bbb;
}
</style>