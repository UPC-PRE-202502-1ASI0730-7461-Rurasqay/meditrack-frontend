<script setup>
import {Doctor} from "../../domain/model/doctor.entity.js";
import {Button as PvButton, InputText as PvInputText} from "primevue";
import {useI18n} from "vue-i18n";
import {ref} from "vue";
import {useOrganizationStore} from "../../application/organization.store.js";
import {useRouter, useRoute} from "vue-router";
import {storeToRefs} from "pinia";

const router = useRouter();
const route = useRoute();

const {t} = useI18n();

const form = ref({
  name: '',
  lastname: '',
  age: null,
  specialty: '',
  phone: null,
  email: ''
});

const store = useOrganizationStore();

const {organization} = storeToRefs(store);
const {addDoctor} = store;

const navigateBack = () => {
  const organizationId = route.params.organizationId;
  const userRole = route.params.userRole;
  const userId = route.params.userId;
  router.push(`/organization/${organizationId}/${userRole}/${userId}/doctors`);
}

const saveDoctor = () => {
  const organizationId = route.params.organizationId;
  const doctorData = {
    fullName: `${form.value.name} ${form.value.lastname}`,
    specialty: form.value.specialty,
    age: form.value.age ? parseInt(form.value.age) : null,
    phoneNumber: form.value.phone,
    email: form.value.email,
    organizationId: organizationId ? parseInt(organizationId) : null
  };
  addDoctor(doctorData);
  navigateBack();
}

</script>

<template>
  <div class="form-container">
    <pv-card class="doctor-form-card">
      <template #header>
        <div class="card-header-custom">
          <i class="pi pi-user-plus text-6xl text-white"></i>
        </div>
      </template>
      <template #title>
        <h2 class="text-3xl font-bold text-primary text-center">{{ t('organization.doctor-form.title') }}</h2>
      </template>
      <template #content>
        <form @submit.prevent="saveDoctor" class="form-content">
          <div class="form-grid">
            <!-- Left Column -->
            <div class="form-column">
              <div class="field">
                <label for="name" class="field-label">
                  <i class="pi pi-user text-primary mr-2"></i>
                  {{ t('organization.doctor-form.doctor-name') }}
                </label>
                <pv-input-text 
                  type="text" 
                  id="name" 
                  v-model="form.name"
                  :placeholder="t('organization.doctor-form.doctor-name')" 
                  required
                  class="w-full"
                />
              </div>
              
              <div class="field">
                <label for="age" class="field-label">
                  <i class="pi pi-calendar text-primary mr-2"></i>
                  {{ t('organization.doctor-form.doctor-age') }}
                </label>
                <pv-input-text 
                  type="number" 
                  id="age" 
                  v-model="form.age"
                  :placeholder="t('organization.doctor-form.doctor-age')" 
                  required
                  class="w-full"
                />
              </div>
              
              <div class="field">
                <label for="phone" class="field-label">
                  <i class="pi pi-phone text-primary mr-2"></i>
                  {{ t('organization.doctor-form.doctor-phone') }}
                </label>
                <pv-input-text 
                  type="text" 
                  id="phone" 
                  v-model="form.phone"
                  :placeholder="t('organization.doctor-form.doctor-phone')" 
                  required
                  class="w-full"
                />
              </div>
            </div>
            
            <!-- Right Column -->
            <div class="form-column">
              <div class="field">
                <label for="lastname" class="field-label">
                  <i class="pi pi-user text-primary mr-2"></i>
                  {{ t('organization.doctor-form.doctor-lastname') }}
                </label>
                <pv-input-text 
                  type="text" 
                  id="lastname" 
                  v-model="form.lastname"
                  :placeholder="t('organization.doctor-form.doctor-lastname')" 
                  required
                  class="w-full"
                />
              </div>
              
              <div class="field">
                <label for="specialty" class="field-label">
                  <i class="pi pi-briefcase text-primary mr-2"></i>
                  {{ t('organization.doctor-form.doctor-specialty') }}
                </label>
                <pv-input-text 
                  type="text" 
                  id="specialty" 
                  v-model="form.specialty"
                  :placeholder="t('organization.doctor-form.doctor-specialty')" 
                  required
                  class="w-full"
                />
              </div>
              
              <div class="field">
                <label for="email" class="field-label">
                  <i class="pi pi-envelope text-primary mr-2"></i>
                  {{ t('organization.doctor-form.doctor-email') }}
                </label>
                <pv-input-text 
                  type="email" 
                  id="email" 
                  v-model="form.email"
                  :placeholder="t('organization.doctor-form.doctor-email')" 
                  required
                  class="w-full"
                />
              </div>
            </div>
          </div>
          
          <div class="form-actions">
            <pv-button 
              type="button"
              :label="t('organization.doctor-form.cancel-button')"
              @click="navigateBack"
              class="p-button-outlined p-button-secondary"
              icon="pi pi-times"
            />
            <pv-button 
              type="submit" 
              :label="t('organization.doctor-form.save-doctor-button')"
              icon="pi pi-check"
              class="p-button-primary"
            />
          </div>
        </form>
      </template>
    </pv-card>
  </div>
</template>
<style scoped>
.form-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  min-height: calc(100vh - 200px);
}

.doctor-form-card {
  max-width: 900px;
  width: 100%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card-header-custom {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.form-content {
  padding: 1rem 0;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.form-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-label {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #495057;
  font-size: 0.95rem;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .form-container {
    padding: 1rem;
  }
}
</style>