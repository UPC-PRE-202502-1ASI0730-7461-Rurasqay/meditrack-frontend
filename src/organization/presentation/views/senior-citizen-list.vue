<script setup>
import { useOrganizationStore } from "../../application/organization.store.js";
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { storeToRefs } from "pinia";
import { useRouter, useRoute } from "vue-router";
import { useConfirm } from "primevue/useconfirm";

const { t } = useI18n();
const store = useOrganizationStore();
const router = useRouter();
const route = useRoute();
const confirm = useConfirm();

// Get route params
const organizationId = computed(() => route.params.organizationId);
const userRole = computed(() => route.params.userRole);
const userId = computed(() => route.params.userId);

// Get data from store
const {
  filteredSeniorCitizens,
  seniorCitizensLoaded,
  errors
} = storeToRefs(store);

const {
  fetchSeniorCitizens,
  deleteSeniorCitizen
} = store;

const showForm = ref(false);
const editingSeniorCitizen = ref(null);

onMounted(async () => {
  console.log('SeniorCitizenList mounted');
  if (!seniorCitizensLoaded.value) {
    await fetchSeniorCitizens();
    console.log('Senior citizens loaded:', seniorCitizensLoaded.value);
    console.log('Senior citizens:', seniorCitizens.value);
  }
  // Also load caregivers to show names in assignments
  if (!store.caregiversLoaded) {
    await store.fetchCaregivers();
  }
});

const haveSeniorCitizens = computed(() => {
  return filteredSeniorCitizens.value && filteredSeniorCitizens.value.length > 0;
});

// Check if user can modify senior citizens (only admins can)
const canModifySeniorCitizens = computed(() => {
  return userRole.value === 'admin';
});

const openAddSeniorCitizenForm = () => {
  editingSeniorCitizen.value = null;
  router.push({ 
    name: 'senior-citizen-new',
    params: { 
      organizationId: organizationId.value,
      userRole: userRole.value,
      userId: userId.value
    }
  });
};

const openEditSeniorCitizenForm = (seniorCitizen) => {
  router.push({ 
    name: 'senior-citizen-edit', 
    params: { 
      organizationId: organizationId.value,
      userRole: userRole.value,
      userId: userId.value,
      id: seniorCitizen.id 
    } 
  });
};

const navigateToDetails = (id) => {
  router.push({ 
    name: 'senior-citizen-details-tab', 
    params: { 
      organizationId: organizationId.value,
      userRole: userRole.value,
      userId: userId.value,
      id 
    } 
  });
};

const confirmDelete = (seniorCitizen) => {
  confirm.require({
    message: t('senior-citizen.confirmDelete', { name: seniorCitizen.fullName }),
    header: t('senior-citizen.deleteHeader'),
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      deleteSeniorCitizen(seniorCitizen);
      console.log('Delete senior citizen:', seniorCitizen);
    }
  });
};

// Helper to get assigned person name (doctor or caregiver)
const getAssignedPerson = (seniorCitizen) => {
  if (seniorCitizen.assignedDoctorId) {
    const doctor = store.doctors.find(d => d.id === seniorCitizen.assignedDoctorId);
    return { type: 'doctor', name: doctor ? doctor.fullName : `Doctor ID: ${seniorCitizen.assignedDoctorId}` };
  }
  if (seniorCitizen.assignedCaregiverId) {
    const caregiver = store.caregivers.find(c => c.id === seniorCitizen.assignedCaregiverId);
    return { type: 'caregiver', name: caregiver ? caregiver.fullName : `Caregiver ID: ${seniorCitizen.assignedCaregiverId}` };
  }
  return null;
};
</script>

<template>
  <div class="p-4">
    <h1>{{ t('senior-citizen.title') }}</h1>

    <!-- Error state -->
    <div v-if="errors.length > 0" class="error-state mb-4">
      <pv-message severity="error">
        {{ errors.map(e => e.message).join(', ') }}
      </pv-message>
    </div>

    <!-- Empty state -->
    <div v-if="!haveSeniorCitizens && !errors.length" class="empty-state text-center p-6">
      <p class="text-xl mb-4">{{ t('senior-citizen.empty') }}</p>
      <pv-button
          v-if="canModifySeniorCitizens"
          :label="t('senior-citizen.add')"
          icon="pi pi-plus"
          class="p-button-primary"
          @click="openAddSeniorCitizenForm"
      />
    </div>

    <!-- List of senior citizens -->
    <div v-else-if="haveSeniorCitizens">
      <pv-button
          v-if="canModifySeniorCitizens"
          :label="t('senior-citizen.add')"
          class="mb-3"
          icon="pi pi-plus"
          @click="openAddSeniorCitizenForm"
      />
      
      <pv-data-table
          :loading="!seniorCitizensLoaded"
          :value="filteredSeniorCitizens"
          paginator
          :rows="5"
          :rows-per-page-options="[5, 10, 20]"
          striped-rows
          table-style="min-width: 50rem"
      >
        <pv-column :header="t('senior-citizen.id')" field="id" sortable>
          <template #body="slotProps">
            <a
                href="#"
                class="text-blue-600 hover:underline"
                @click.prevent="navigateToDetails(slotProps.data.id)"
            >
              {{ slotProps.data.id }}
            </a>
          </template>
        </pv-column>
        
        <pv-column :header="t('senior-citizen.fullName')" field="fullName" sortable>
          <template #body="slotProps">
            <a
                href="#"
                class="text-blue-600 hover:underline"
                @click.prevent="navigateToDetails(slotProps.data.id)"
            >
              {{ slotProps.data.fullName }}
            </a>
          </template>
        </pv-column>
        
        <pv-column :header="t('senior-citizen.age')" field="age" sortable />
        
        <pv-column :header="t('senior-citizen.dni')" field="dni" sortable />
        
        <pv-column :header="t('senior-citizen.assignedTo')">
          <template #body="slotProps">
            <span v-if="getAssignedPerson(slotProps.data)">
              {{ getAssignedPerson(slotProps.data).name }}
              <pv-badge
                  :value="getAssignedPerson(slotProps.data).type === 'doctor' ? t('doctor.title') : t('caregiver.title')"
                  :severity="getAssignedPerson(slotProps.data).type === 'doctor' ? 'info' : 'success'"
                  class="ml-2"
              />
            </span>
            <span v-else class="text-gray-500">{{ t('senior-citizen.unassigned') }}</span>
          </template>
        </pv-column>
        
        <pv-column v-if="canModifySeniorCitizens" :header="t('senior-citizen.actions')">
          <template #body="slotProps">
            <pv-button
                icon="pi pi-pencil"
                rounded
                text
                @click="openEditSeniorCitizenForm(slotProps.data)"
            />
            <pv-button
                icon="pi pi-trash"
                rounded
                severity="danger"
                text
                @click="confirmDelete(slotProps.data)"
            />
          </template>
        </pv-column>
      </pv-data-table>
    </div>

    <pv-confirm-dialog />
  </div>
</template>

<style scoped>
.empty-state {
  background: #f8f9fa;
  border-radius: 8px;
  margin: 2rem 0;
}
</style>
