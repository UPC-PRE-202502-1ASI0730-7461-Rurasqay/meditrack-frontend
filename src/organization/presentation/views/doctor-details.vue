<script setup>

import {useRoute, useRouter} from "vue-router";
import {useOrganizationStore} from "../../application/organization.store.js";
import {computed, onMounted, ref} from "vue";
import {storeToRefs} from "pinia";
import useIAMStore from "../../../identity-access-managment/application/iam.store.js";
import {useI18n} from "vue-i18n";
import {useConfirm} from "primevue/useconfirm";

const route = useRoute();
const router = useRouter();
const store = useOrganizationStore();
const iamStore = useIAMStore();
const confirm = useConfirm();
const {t} = useI18n();

const {currentUser} = storeToRefs(iamStore);
const {doctorsByOrganization, doctorsLoaded, organization, organizationsLoaded, seniorCitizens, caregivers} = storeToRefs(store);
const {
  getDoctorsById, 
  fetchDoctors, 
  fetchOrganizationById,
  assignSeniorCitizenToDoctor,
  unassignSeniorCitizenFromDoctor
} = store;

const doctor = ref(null);
const loading = ref(true);
const selectedSeniorCitizenId = ref(null);

const doctorId = computed(() => route.params.id ? parseInt(route.params.id) : null);
const organizationId = computed(() => route.params.organizationId ? parseInt(route.params.organizationId) : null);

// Computed properties for senior citizens
const assignedSeniorCitizens = computed(() => {
  if (!doctor.value || !seniorCitizens.value || seniorCitizens.value.length === 0) return [];
  return seniorCitizens.value.filter(sc => sc.assignedDoctorId === doctor.value.id);
});

const availableSeniorCitizens = computed(() => {
  if (!doctor.value || !seniorCitizens.value || seniorCitizens.value.length === 0) return [];
  // Show senior citizens from the same organization that are not assigned to this doctor
  return seniorCitizens.value.filter(sc => 
    sc.organizationId === doctor.value.organizationId && 
    sc.assignedDoctorId !== doctor.value.id
  );
});

const getAssignedPersonName = (seniorCitizen) => {
  if (seniorCitizen.assignedCaregiverId) {
    const caregiver = caregivers.value.find(c => c.id === seniorCitizen.assignedCaregiverId);
    return caregiver ? caregiver.fullName : `Caregiver ID: ${seniorCitizen.assignedCaregiverId}`;
  }
  if (seniorCitizen.assignedDoctorId && seniorCitizen.assignedDoctorId !== doctor.value?.id) {
    const otherDoctor = doctorsByOrganization.value.find(d => d.id === seniorCitizen.assignedDoctorId);
    return otherDoctor ? `Dr. ${otherDoctor.fullName}` : `Doctor ID: ${seniorCitizen.assignedDoctorId}`;
  }
  return null;
};

const isAssignedToAnother = (seniorCitizen) => {
  // Check if assigned to a caregiver or another doctor
  return seniorCitizen.assignedCaregiverId || 
         (seniorCitizen.assignedDoctorId && seniorCitizen.assignedDoctorId !== doctor.value?.id);
};

const canAssignSelectedSeniorCitizen = computed(() => {
  if (!selectedSeniorCitizenId.value) return false;
  const selectedSenior = availableSeniorCitizens.value.find(sc => sc.id === selectedSeniorCitizenId.value);
  if (!selectedSenior) return false;
  // Block if assigned to caregiver (mutual exclusion)
  return !selectedSenior.assignedCaregiverId;
});

const onAssignSeniorCitizen = async () => {
  if (selectedSeniorCitizenId.value && doctor.value) {
    // Check if the selected senior citizen is already assigned to another
    const selectedSenior = availableSeniorCitizens.value.find(sc => sc.id === selectedSeniorCitizenId.value);
    
    if (selectedSenior && isAssignedToAnother(selectedSenior)) {
      if (selectedSenior.assignedCaregiverId) {
        alert(t('doctor.errors.cannotAssignToCaregiver'));
        return;
      }
    }
    
    try {
      await assignSeniorCitizenToDoctor(doctor.value.id, selectedSeniorCitizenId.value);
      selectedSeniorCitizenId.value = null;
    } catch (error) {
      console.error('Error assigning senior citizen:', error);
      alert(t('doctor.errors.assignError'));
    }
  }
};

const onUnassignSeniorCitizen = (seniorCitizen) => {
  confirm.require({
    message: t('doctor.confirmUnassign', { name: seniorCitizen.fullName }),
    header: t('doctor.unassignHeader'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('doctor.unassign'),
    rejectLabel: t('senior-citizen.cancel'),
    accept: async () => {
      try {
        await unassignSeniorCitizenFromDoctor(doctor.value.id, seniorCitizen.id);
      } catch (error) {
        console.error('Error unassigning senior citizen:', error);
      }
    }
  });
};

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
    
    // Load senior citizens from the same organization
    if (organizationId.value) {
      await store.fetchSeniorCitizensByOrganization(organizationId.value);
    }
    
    // Load caregivers for displaying assignments
    await store.fetchCaregivers();
  } else {
    console.warn('No doctor found with id:', route.params.id);
  }
  
  loading.value = false;
})

</script>

<template>
  <div class="p-4">
    <pv-confirm-dialog></pv-confirm-dialog>
    
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

        <!-- Assigned Senior Citizens Section -->
        <div class="mt-5">
          <h3>{{ t('doctor.assignedSeniorCitizens') }}</h3>
          <hr class="my-3" />

          <div v-if="assignedSeniorCitizens.length === 0" class="text-center p-4">
            <p class="text-gray-500">{{ t('doctor.noAssignedSeniorCitizens') }}</p>
          </div>
          
          <pv-data-table 
            v-else
            :value="assignedSeniorCitizens" 
            striped-rows 
            class="mb-4"
            paginator
            :rows="5"
          >
            <pv-column field="id" :header="t('senior-citizen.id')" sortable></pv-column>
            <pv-column field="fullName" :header="t('senior-citizen.fullName')" sortable></pv-column>
            <pv-column :header="t('senior-citizen.age')">
              <template #body="slotProps">
                {{ slotProps.data.calculateAge() }}
              </template>
            </pv-column>
            <pv-column :header="t('senior-citizen.actions')">
              <template #body="slotProps">
                <pv-button
                  icon="pi pi-times"
                  :label="t('doctor.unassign')"
                  class="p-button-sm p-button-danger p-button-outlined"
                  @click="onUnassignSeniorCitizen(slotProps.data)"
                />
              </template>
            </pv-column>
          </pv-data-table>
        </div>

        <!-- Assign Senior Citizen Section -->
        <div class="mt-4">
          <h3>{{ t('doctor.assignSeniorCitizen') }}</h3>
          <hr class="my-3" />

          <div class="flex gap-2 align-items-end">
            <div class="flex-1">
              <label for="seniorCitizen" class="block mb-2">{{ t('doctor.selectSeniorCitizen') }}</label>
              <pv-select
                id="seniorCitizen"
                v-model="selectedSeniorCitizenId"
                :options="availableSeniorCitizens"
                option-label="fullName"
                option-value="id"
                :placeholder="t('doctor.selectSeniorCitizen')"
                class="w-full"
                :filter="true"
              >
                <template #option="slotProps">
                  <div class="flex justify-content-between align-items-center w-full">
                    <span>{{ slotProps.option.fullName }}</span>
                    <span v-if="getAssignedPersonName(slotProps.option)" class="text-sm text-gray-500">
                      ({{ t('senior-citizen.assignedTo') }}: {{ getAssignedPersonName(slotProps.option) }})
                    </span>
                    <pv-tag 
                      v-if="isAssignedToAnother(slotProps.option)" 
                      :value="slotProps.option.assignedCaregiverId ? t('caregiver.title') : t('doctor.title')"
                      severity="warning"
                      class="ml-2"
                    />
                  </div>
                </template>
              </pv-select>
              <small v-if="selectedSeniorCitizenId && !canAssignSelectedSeniorCitizen" class="text-red-500">
                {{ t('doctor.errors.cannotAssignToCaregiver') }}
              </small>
            </div>
            <pv-button
              :label="t('doctor.assign')"
              icon="pi pi-plus"
              @click="onAssignSeniorCitizen"
              :disabled="!canAssignSelectedSeniorCitizen"
            />
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