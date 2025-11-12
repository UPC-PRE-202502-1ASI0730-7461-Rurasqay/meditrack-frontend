<script setup>
import { useOrganizationStore } from "../../application/organization.store.js";
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { useConfirm } from "primevue/useconfirm";

const { t } = useI18n();
const store = useOrganizationStore();
const router = useRouter();
const route = useRoute();
const confirm = useConfirm();

const {
  caregiversByOrganization,
  getCaregiversById
} = store;

const caregiverId = computed(() => route.params.id ? parseInt(route.params.id) : null);
const caregiver = ref(null);
const selectedSeniorCitizenId = ref(null);

// Mock data for senior citizens - this would come from the store in real implementation
const assignedSeniorCitizens = ref([]);
const availableSeniorCitizens = ref([]);

onMounted(() => {
  if (caregiverId.value) {
    loadCaregiver(caregiverId.value);
  }
});

const loadCaregiver = (id) => {
  const caregiverData = getCaregiversById(id);
  if (caregiverData && caregiverData.length > 0) {
    caregiver.value = caregiverData[0];
    
    // In a real implementation, these would be loaded from the store
    // based on the caregiver's assignedSeniorIds
    assignedSeniorCitizens.value = [];
    availableSeniorCitizens.value = [];
  }
};

const getAssignedPersonName = (seniorCitizen) => {
  // This would check if the senior citizen is assigned to a doctor or another caregiver
  return null;
};

const isAssignedToAnother = (seniorCitizen) => {
  // Check if assigned to another caregiver or to a doctor
  return false;
};

const canAssignSelectedSeniorCitizen = computed(() => {
  if (!selectedSeniorCitizenId.value) return false;
  const selectedSenior = availableSeniorCitizens.value.find(sc => sc.id === selectedSeniorCitizenId.value);
  if (!selectedSenior) return false;
  // Block if assigned to doctor (exclusión mutua)
  return !selectedSenior.assignedDoctorId;
});

const onAssignSeniorCitizen = () => {
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
      // This would call the store method to assign senior citizen to caregiver
      // store.assignSeniorCitizenToCaregiver(caregiver.value.id, selectedSeniorCitizenId.value);
      
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
    accept: () => {
      try {
        // This would call the store method to unassign senior citizen from caregiver
        // store.unassignSeniorCitizenFromCaregiver(caregiver.value.id, seniorCitizen.id);
      } catch (error) {
        console.error('Error unassigning senior citizen:', error);
      }
    }
  });
};

const onBackToList = () => {
  router.push({ name: 'caregiver-list' });
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
                  <div class="flex align-items-center justify-content-between">
                    <div class="flex align-items-center gap-3">
                      <img
                          :src="seniorCitizen.imageUrl || '/assets/default-senior-citizen.png'"
                          :alt="seniorCitizen.fullName"
                          class="senior-citizen-avatar"
                          style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover;"
                      />
                      <div>
                        <p class="font-bold">{{ seniorCitizen.fullName }}</p>
                      </div>
                    </div>
                    <pv-button
                        icon="pi pi-times"
                        class="p-button-rounded p-button-danger p-button-text"
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
            <pv-dropdown
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
            </pv-dropdown>
            
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
</style>
