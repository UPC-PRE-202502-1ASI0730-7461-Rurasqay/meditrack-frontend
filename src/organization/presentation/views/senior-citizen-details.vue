<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useOrganizationStore } from '../../application/organization.store.js';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const organizationStore = useOrganizationStore();

const isLoading = ref(true);
const seniorCitizenId = computed(() => parseInt(route.params.id));
const organizationId = computed(() => route.params.organizationId);
const userRole = computed(() => route.params.userRole);
const userId = computed(() => route.params.userId);

const seniorCitizen = computed(() => organizationStore.currentSeniorCitizen);

// Get assigned person information
const assignedPerson = computed(() => {
  if (!seniorCitizen.value) return null;
  
  if (seniorCitizen.value.assignedDoctorId) {
    const doctor = organizationStore.doctors.find(d => d.id === seniorCitizen.value.assignedDoctorId);
    return {
      type: 'doctor',
      id: seniorCitizen.value.assignedDoctorId,
      name: doctor ? doctor.fullName : `Doctor ID: ${seniorCitizen.value.assignedDoctorId}`
    };
  }
  
  if (seniorCitizen.value.assignedCaregiverId) {
    const caregiver = organizationStore.caregivers.find(c => c.id === seniorCitizen.value.assignedCaregiverId);
    return {
      type: 'caregiver',
      id: seniorCitizen.value.assignedCaregiverId,
      name: caregiver ? caregiver.fullName : `Caregiver ID: ${seniorCitizen.value.assignedCaregiverId}`
    };
  }
  
  return null;
});

onMounted(async () => {
  try {
    await organizationStore.fetchSeniorCitizenById(seniorCitizenId.value);
    
    // Load doctors and caregivers if not loaded yet
    if (!organizationStore.doctorsLoaded) {
      await organizationStore.fetchDoctors();
    }
    if (!organizationStore.caregiversLoaded) {
      await organizationStore.fetchCaregivers();
    }
  } catch (error) {
    console.error('Error loading senior citizen details:', error);
  } finally {
    isLoading.value = false;
  }
});

const goBack = () => {
  router.push(`/organization/${organizationId.value}/${userRole.value}/${userId.value}/senior-citizens`);
};
</script>

<template>
  <div class="senior-citizen-details">
    <div v-if="isLoading" class="loading-container">
      <pv-progress-spinner />
      <p>{{ t('common.loading') }}...</p>
    </div>
    <pv-card v-else-if="seniorCitizen" class="details-card">
      <template v-if="seniorCitizen.imageUrl" #header>
        <div class="card-header">
          <img :src="seniorCitizen.imageUrl" :alt="seniorCitizen.fullName" class="profile-image" />
        </div>
      </template>
      <template #title>
        <div class="card-title-section">
          <h2>{{ seniorCitizen.fullName }}</h2>
        </div>
      </template>
      <template #content>
        <div class="details-grid">
          <div class="detail-item">
            <strong>{{ t('senior-citizen.id') }}:</strong>
            <span>{{ seniorCitizen.id }}</span>
          </div>
          <div class="detail-item">
            <strong>{{ t('senior-citizen.dni') }}:</strong>
            <span>{{ seniorCitizen.dni }}</span>
          </div>
          <div class="detail-item">
            <strong>{{ t('senior-citizen.firstName') }}:</strong>
            <span>{{ seniorCitizen.firstName }}</span>
          </div>
          <div class="detail-item">
            <strong>{{ t('senior-citizen.lastName') }}:</strong>
            <span>{{ seniorCitizen.lastName }}</span>
          </div>
          <div class="detail-item">
            <strong>{{ t('senior-citizen.age') }}:</strong>
            <span>{{ seniorCitizen.age }} {{ t('senior-citizen.age').toLowerCase() }}</span>
          </div>
          <div class="detail-item">
            <strong>{{ t('senior-citizen.gender') }}:</strong>
            <span>{{ seniorCitizen.gender }}</span>
          </div>
          <div class="detail-item">
            <strong>{{ t('senior-citizen.weight') }}:</strong>
            <span>{{ seniorCitizen.weight }} kg</span>
          </div>
          <div class="detail-item">
            <strong>{{ t('senior-citizen.height') }}:</strong>
            <span>{{ seniorCitizen.height }} cm</span>
          </div>
          <div class="detail-item">
            <strong>{{ t('senior-citizen.deviceId') }}:</strong>
            <span>{{ seniorCitizen.deviceId || 'N/A' }}</span>
          </div>
          <div v-if="assignedPerson" class="detail-item assigned-info">
            <strong>{{ t('senior-citizen.assignedTo') }}:</strong>
            <div class="assigned-person">
              <span class="person-id">ID: {{ assignedPerson.id }}</span>
              <span class="person-name">{{ assignedPerson.name }}</span>
              <pv-tag :value="assignedPerson.type === 'doctor' ? t('doctor.title') : t('caregiver.title')" :severity="assignedPerson.type === 'doctor' ? 'info' : 'success'" />
            </div>
          </div>
          <div v-else class="detail-item">
            <strong>{{ t('senior-citizen.assignedTo') }}:</strong>
            <span class="text-muted">{{ t('senior-citizen.unassigned') }}</span>
          </div>
        </div>
      </template>
    </pv-card>
    <div v-else class="empty-state">
      <i class="pi pi-user" style="font-size: 3rem; color: #6c757d;"></i>
      <p>{{ t('caregiver.notFound') }}</p>
      <pv-button :label="t('caregiver.backToList')" icon="pi pi-arrow-left" @click="goBack" />
    </div>
  </div>
</template>

<style scoped>
.senior-citizen-details {
  padding: 0;
  margin: 0;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
}

.details-card {
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 200px;
}

.profile-image {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.card-title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.card-title-section h2 {
  margin: 0;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 0;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 6px;
  background-color: #f8f9fa;
}

.detail-item strong {
  color: #495057;
  font-weight: 600;
  font-size: 0.9rem;
}

.detail-item span {
  color: #212529;
  font-size: 1rem;
}

.detail-item .text-muted {
  color: #6c757d;
  font-style: italic;
}

.detail-item.assigned-info {
  grid-column: 1 / -1;
  background-color: #e3f2fd;
}

.assigned-person {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.person-id {
  font-size: 0.9rem;
  font-weight: 600;
  color: #495057;
  background-color: #fff;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.person-name {
  font-size: 1.1rem;
  font-weight: 500;
  color: #1976d2;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  gap: 1rem;
}

.empty-state p {
  color: #6c757d;
  font-size: 1.1rem;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .detail-item {
    background-color: #2d2d2d;
  }
  
  .detail-item strong {
    color: #e0e0e0;
  }
  
  .detail-item span {
    color: #b0b0b0;
  }
  
  .detail-item.assigned-info {
    background-color: #1a237e;
  }
  
  .person-id {
    background-color: #424242;
    color: #e0e0e0;
  }
  
  .person-name {
    color: #64b5f6;
  }
  
  .empty-state p {
    color: #b0b0b0;
  }
}
</style>
