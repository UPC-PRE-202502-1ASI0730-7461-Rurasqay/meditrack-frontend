<script setup>
import { useOrganizationStore } from "../../application/organization.store.js";
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { useConfirm } from "primevue/useconfirm";
import { storeToRefs } from "pinia";

const { t } = useI18n();
const store = useOrganizationStore();
const router = useRouter();
const route = useRoute();
const confirm = useConfirm();

const { seniorCitizens, doctors } = storeToRefs(store);

const {
  getCaregiversById,
  assignSeniorCitizenToCaregiver,
  unassignSeniorCitizenFromCaregiver
} = store;

const caregiverId = computed(() => route.params.id ? parseInt(route.params.id) : null);
const organizationId = computed(() => route.params.organizationId ? parseInt(route.params.organizationId) : null);
const caregiver = ref(null);
const selectedSeniorCitizenId = ref(null);

// Computed properties for senior citizens
const assignedSeniorCitizens = computed(() => {
  if (!caregiver.value || !seniorCitizens.value || seniorCitizens.value.length === 0) return [];
  return seniorCitizens.value.filter(sc => sc.assignedCaregiverId === caregiver.value.id);
});

const availableSeniorCitizens = computed(() => {
  if (!caregiver.value || !seniorCitizens.value || seniorCitizens.value.length === 0) return [];
  // Show senior citizens from the same organization that are not assigned to this caregiver
  return seniorCitizens.value.filter(sc => 
    sc.organizationId === caregiver.value.organizationId && 
    sc.assignedCaregiverId !== caregiver.value.id
  );
});

onMounted(async () => {
  if (caregiverId.value && organizationId.value) {
    // Load caregiver data
    await loadCaregiver(caregiverId.value);
    
    // Load senior citizens from the same organization
    await store.fetchSeniorCitizensByOrganization(organizationId.value);
    
    // Load doctors for displaying assignments
    await store.fetchDoctorsByOrganization(organizationId.value);
  }
});

const loadCaregiver = async (id) => {
  const caregiverData = getCaregiversById(id);
  if (caregiverData && caregiverData.length > 0) {
    caregiver.value = caregiverData[0];
  }
};

const getAssignedPersonName = (seniorCitizen) => {
  if (seniorCitizen.assignedDoctorId) {
    const doctor = doctors.value.find(d => d.id === seniorCitizen.assignedDoctorId);
    return doctor ? `Dr. ${doctor.fullName}` : `Doctor ID: ${seniorCitizen.assignedDoctorId}`;
  }
  if (seniorCitizen.assignedCaregiverId && seniorCitizen.assignedCaregiverId !== caregiver.value?.id) {
    const caregiverData = getCaregiversById(seniorCitizen.assignedCaregiverId);
    const otherCaregiver = caregiverData && caregiverData.length > 0 ? caregiverData[0] : null;
    return otherCaregiver ? otherCaregiver.fullName : `Caregiver ID: ${seniorCitizen.assignedCaregiverId}`;
  }
  return null;
};

const isAssignedToAnother = (seniorCitizen) => {
  // Check if assigned to a doctor or another caregiver
  return seniorCitizen.assignedDoctorId || 
         (seniorCitizen.assignedCaregiverId && seniorCitizen.assignedCaregiverId !== caregiver.value?.id);
};

const canAssignSelectedSeniorCitizen = computed(() => {
  if (!selectedSeniorCitizenId.value) return false;
  const selectedSenior = availableSeniorCitizens.value.find(sc => sc.id === selectedSeniorCitizenId.value);
  if (!selectedSenior) return false;
  // Block if assigned to doctor (exclusión mutua)
  return !selectedSenior.assignedDoctorId;
});

const onAssignSeniorCitizen = async () => {
  if (selectedSeniorCitizenId.value && caregiver.value) {
    // Check if the selected senior citizen is already assigned to another
    const selectedSenior = availableSeniorCitizens.value.find(sc => sc.id === selectedSeniorCitizenId.value);
    
    if (selectedSenior && isAssignedToAnother(selectedSenior)) {
      if (selectedSenior.assignedDoctorId) {
        alert(t('caregiver.errors.cannotAssignToDoctor'));
        return;
      }
    }
    
    try {
      await assignSeniorCitizenToCaregiver(caregiver.value.id, selectedSeniorCitizenId.value);
      console.log('Senior citizen assigned successfully');
      // Refresh senior citizens to reflect the assignment
      await store.fetchSeniorCitizensByOrganization(organizationId.value);
      selectedSeniorCitizenId.value = null;
    } catch (error) {
      console.error('Error assigning senior citizen:', error);
      alert(error.message || t('caregiver.errors.assignError'));
    }
  }
};

const onUnassignSeniorCitizen = (seniorCitizen) => {
  confirm.require({
    message: t('caregiver.confirmUnassign', { name: seniorCitizen.fullName }),
    header: t('caregiver.unassignHeader'),
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      try {
        await unassignSeniorCitizenFromCaregiver(caregiver.value.id, seniorCitizen.id);
        console.log('Senior citizen unassigned successfully');
        // Refresh senior citizens to reflect the unassignment
        await store.fetchSeniorCitizensByOrganization(organizationId.value);
      } catch (error) {
        console.error('Error unassigning senior citizen:', error);
        alert(error.message || t('caregiver.errors.assignError'));
      }
    }
  });
};

const onBackToList = () => {
  const organizationId = route.params.organizationId;
  const userRole = route.params.userRole;
  const userId = route.params.userId;
  router.push(`/organization/${organizationId}/${userRole}/${userId}/caregivers`);
  
};
</script>

<template>
  <div class="p-4">
    <div v-if="caregiver" class="caregiver-detail-container">
      <!-- Caregiver Profile Section -->
      <pv-card class="mb-4">
        <template #content>
          <div class="flex align-items-center gap-4">
            <img
                :src="caregiver.imageUrl || '/assets/default-caregiver.png'"
                :alt="caregiver.fullName"
                class="caregiver-avatar"
                style="width: 150px; height: 150px; border-radius: 50%; object-fit: cover;"
            />
            
            <div class="caregiver-info">
              <h2 class="text-3xl font-bold mb-3">{{ t('caregiver.title') }} {{ caregiver.fullName }}</h2>
              <div class="caregiver-details">
                <p class="mb-2">
                  <strong>{{ t('caregiver.age') }}:</strong> {{ caregiver.age }} |
                  <strong>{{ t('caregiver.phoneNumber') }}:</strong> {{ caregiver.phoneNumber }}
                </p>
                <p class="mb-2">
                  <strong>{{ t('caregiver.email') }}:</strong> {{ caregiver.email }}
                </p>
              </div>
            </div>
          </div>
        </template>
      </pv-card>

      <!-- Assigned Senior Citizens Section -->
      <pv-card class="mb-4">
        <template #title>
          <h3>{{ t('caregiver.assignedSeniorCitizens') }}</h3>
        </template>
        <template #content>
          <div v-if="assignedSeniorCitizens.length === 0" class="text-center p-4">
            <p>{{ t('senior-citizen.empty') }}</p>
          </div>
          
          <div v-else class="grid">
            <div
                v-for="seniorCitizen in assignedSeniorCitizens"
                :key="seniorCitizen.id"
                class="col-12 md:col-6 lg:col-4"
            >
              <pv-card class="senior-citizen-card">
                <template #content>
                  <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px;">
                    <img
                        :src="seniorCitizen.imageUrl || '/assets/default-senior-citizen.png'"
                        :alt="seniorCitizen.fullName"
                        style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover; flex-shrink: 0;"
                    />
                    <span style="flex: 1; font-weight: bold;">{{ seniorCitizen.fullName }}</span>
                    <pv-button
                        icon="pi pi-times"
                        class="p-button-rounded p-button-danger p-button-text"
                        style="flex-shrink: 0;"
                        :title="t('caregiver.unassignSeniorCitizen')"
                        @click="onUnassignSeniorCitizen(seniorCitizen)"
                    />
                  </div>
                </template>
              </pv-card>
            </div>
          </div>
        </template>
      </pv-card>

      <!-- Available Senior Citizens Section -->
      <pv-card class="mb-4">
        <template #title>
          <h3>{{ t('caregiver.availableSeniorCitizens') }}</h3>
        </template>
        <template #content>
          <div class="flex gap-2">
            <pv-select
                v-model="selectedSeniorCitizenId"
                :options="availableSeniorCitizens"
                option-label="fullName"
                option-value="id"
                :placeholder="t('caregiver.selectSeniorCitizen')"
                class="flex-1"
            >
              <template #option="slotProps">
                <div>
                  {{ slotProps.option.fullName }}
                  <span v-if="getAssignedPersonName(slotProps.option)" class="text-sm text-gray-600">
                    - ({{ t('caregiver.assignedTo') }}: {{ getAssignedPersonName(slotProps.option) }})
                  </span>
                </div>
              </template>
            </pv-select>
            
            <pv-button
                :label="t('caregiver.assign')"
                icon="pi pi-plus"
                :disabled="!selectedSeniorCitizenId || !canAssignSelectedSeniorCitizen"
                @click="onAssignSeniorCitizen"
            />
          </div>
        </template>
      </pv-card>

      <!-- Back Button -->
      <div class="flex justify-content-center">
        <pv-button
            :label="t('caregiver.backToList')"
            icon="pi pi-arrow-left"
            class="p-button-secondary"
            @click="onBackToList"
        />
      </div>
    </div>

    <div v-else class="text-center p-4">
      <p>{{ t('caregiver.notFound') }}</p>
      <pv-button
          :label="t('caregiver.backToList')"
          icon="pi pi-arrow-left"
          class="p-button-secondary mt-3"
          @click="onBackToList"
      />
    </div>

    <pv-confirm-dialog />
  </div>
</template>

<style scoped>
.caregiver-detail-container {
  max-width: 1200px;
  margin: 0 auto;
}

.senior-citizen-card {
  height: 100%;
}

.senior-citizen-card :deep(.p-card-content) {
  padding: 1.25rem !important;
  padding-right: 3.50rem !important;
  overflow: visible !important;
}
</style>
