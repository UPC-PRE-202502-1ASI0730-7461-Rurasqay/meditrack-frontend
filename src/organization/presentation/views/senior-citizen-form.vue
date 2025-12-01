<script setup>
import { useOrganizationStore } from "../../application/organization.store.js";
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";

const { t } = useI18n();
const store = useOrganizationStore();
const router = useRouter();
const route = useRoute();

const {
  organization
} = store;

const isEditMode = computed(() => !!route.params.id);
const seniorCitizenId = computed(() => route.params.id ? parseInt(route.params.id) : null);

// Form data
const form = ref({
  firstName: '',
  lastName: '',
  birthDate: '',
  gender: '',
  weight: null,
  height: null,
  dni: '',
  imageUrl: '',
  deviceId: null,
  organizationId: null,
  planType: 'freemium',
  assignedDoctorId: null,
  assignedCaregiverId: null
});

const genderOptions = [
  { label: t('senior-citizen.genderMale'), value: 'M' },
  { label: t('senior-citizen.genderFemale'), value: 'F' },
  { label: t('senior-citizen.genderOther'), value: 'Other' }
];

const errors = ref({});

onMounted(() => {
  // Set organization ID from route params
  const organizationId = route.params.organizationId;
  if (organizationId) {
    form.value.organizationId = parseInt(organizationId);
  }

  // Load senior citizen data if editing
  if (isEditMode.value && seniorCitizenId.value) {
    const seniorCitizen = store.getSeniorCitizenById(seniorCitizenId.value);
    if (seniorCitizen) {
      form.value = {
        firstName: seniorCitizen.firstName,
        lastName: seniorCitizen.lastName,
        birthDate: seniorCitizen.birthDate ? new Date(seniorCitizen.birthDate) : '',
        gender: seniorCitizen.gender,
        weight: seniorCitizen.weight,
        height: seniorCitizen.height,
        dni: seniorCitizen.dni,
        imageUrl: seniorCitizen.imageUrl,
        deviceId: seniorCitizen.deviceId,
        organizationId: seniorCitizen.organizationId,
        planType: seniorCitizen.planType || 'freemium',
        assignedDoctorId: seniorCitizen.assignedDoctorId,
        assignedCaregiverId: seniorCitizen.assignedCaregiverId
      };
    }
  }
});

const validate = () => {
  errors.value = {};
  
  if (!form.value.firstName) {
    errors.value.firstName = t('senior-citizen.errors.firstNameRequired');
  }
  
  if (!form.value.lastName) {
    errors.value.lastName = t('senior-citizen.errors.lastNameRequired');
  }
  
  if (!form.value.birthDate) {
    errors.value.birthDate = t('senior-citizen.errors.birthDateRequired');
  }
  
  if (!form.value.gender) {
    errors.value.gender = t('senior-citizen.errors.genderRequired');
  }
  
  if (!form.value.weight || form.value.weight <= 0) {
    errors.value.weight = t('senior-citizen.errors.weightRequired');
  }
  
  if (!form.value.height || form.value.height <= 0) {
    errors.value.height = t('senior-citizen.errors.heightRequired');
  }
  
  if (!form.value.dni) {
    errors.value.dni = t('senior-citizen.errors.dniRequired');
  }
  
  if (!form.value.imageUrl) {
    errors.value.imageUrl = t('senior-citizen.errors.imageUrlRequired');
  } else if (!/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(form.value.imageUrl)) {
    errors.value.imageUrl = t('senior-citizen.errors.imageUrlInvalid');
  }
  
  if (form.value.deviceId === null || form.value.deviceId < 0) {
    errors.value.deviceId = t('senior-citizen.errors.deviceIdRequired');
  }
  
  return Object.keys(errors.value).length === 0;
};

const onSubmit = () => {
  if (!validate()) {
    return;
  }

  const seniorCitizenData = {
    firstName: form.value.firstName,
    lastName: form.value.lastName,
    birthDate: form.value.birthDate,
    gender: form.value.gender,
    weight: parseFloat(form.value.weight),
    height: parseFloat(form.value.height),
    dni: form.value.dni,
    imageUrl: form.value.imageUrl || '/assets/default-senior-citizen.png',
    deviceId: parseInt(form.value.deviceId),
    organizationId: form.value.organizationId,
    planType: form.value.planType || 'freemium',
    assignedDoctorId: form.value.assignedDoctorId,
    assignedCaregiverId: form.value.assignedCaregiverId
  };

  try {
    if (isEditMode.value && seniorCitizenId.value) {
      seniorCitizenData.id = seniorCitizenId.value;
      console.log('Update senior citizen:', seniorCitizenData);
      store.updateSeniorCitizen(seniorCitizenData);
    } else {
      console.log('Add senior citizen:', seniorCitizenData);
      store.addSeniorCitizen(seniorCitizenData);
    }

    // Navigate back to list
    const organizationId = route.params.organizationId;
    const userRole = route.params.userRole;
    const userId = route.params.userId;
    router.push(`/organization/${organizationId}/${userRole}/${userId}/senior-citizens`);
    
  } catch (error) {
    console.error('Error creating/updating senior citizen:', error);
    alert(error.message || t('senior-citizen.errors.saveError'));
  }
};

const onCancel = () => {
  router.push({ name: 'senior-citizen-list' });
};
</script>

<template>
  <div class="p-4">
    <h1>{{ isEditMode ? t('senior-citizen.editTitle') : t('senior-citizen.newTitle') }}</h1>

    <div class="form-container mt-4">
      <form @submit.prevent="onSubmit" class="senior-citizen-form">
        <div class="grid">
          <!-- First Name -->
          <div class="col-12 md:col-6">
            <div class="field">
              <label for="firstName" class="block mb-2">{{ t('senior-citizen.firstName') }}:</label>
              <pv-input-text
                  id="firstName"
                  v-model="form.firstName"
                  :class="{ 'p-invalid': errors.firstName }"
                  class="w-full"
              />
              <small v-if="errors.firstName" class="p-error">{{ errors.firstName }}</small>
            </div>
          </div>

          <!-- Last Name -->
          <div class="col-12 md:col-6">
            <div class="field">
              <label for="lastName" class="block mb-2">{{ t('senior-citizen.lastName') }}:</label>
              <pv-input-text
                  id="lastName"
                  v-model="form.lastName"
                  :class="{ 'p-invalid': errors.lastName }"
                  class="w-full"
              />
              <small v-if="errors.lastName" class="p-error">{{ errors.lastName }}</small>
            </div>
          </div>

          <!-- Birth Date -->
          <div class="col-12 md:col-6">
            <div class="field">
              <label for="birthDate" class="block mb-2">{{ t('senior-citizen.birthDate') }}:</label>
              <pv-calendar
                  id="birthDate"
                  v-model="form.birthDate"
                  date-format="yy-mm-dd"
                  :class="{ 'p-invalid': errors.birthDate }"
                  class="w-full"
                  :show-icon="true"
              />
              <small v-if="errors.birthDate" class="p-error">{{ errors.birthDate }}</small>
            </div>
          </div>

          <!-- Gender -->
          <div class="col-12 md:col-6">
            <div class="field">
              <label for="gender" class="block mb-2">{{ t('senior-citizen.gender') }}:</label>
              <pv-select
                  id="gender"
                  v-model="form.gender"
                  :options="genderOptions"
                  option-label="label"
                  option-value="value"
                  :placeholder="t('senior-citizen.selectGender')"
                  :class="{ 'p-invalid': errors.gender }"
                  class="w-full"
              />
              <small v-if="errors.gender" class="p-error">{{ errors.gender }}</small>
            </div>
          </div>

          <!-- Weight -->
          <div class="col-12 md:col-6">
            <div class="field">
              <label for="weight" class="block mb-2">{{ t('senior-citizen.weight') }} (kg):</label>
              <pv-input-number
                  id="weight"
                  v-model="form.weight"
                  :min="0"
                  :max-fraction-digits="2"
                  :class="{ 'p-invalid': errors.weight }"
                  class="w-full"
              />
              <small v-if="errors.weight" class="p-error">{{ errors.weight }}</small>
            </div>
          </div>

          <!-- Height -->
          <div class="col-12 md:col-6">
            <div class="field">
              <label for="height" class="block mb-2">{{ t('senior-citizen.height') }} (cm):</label>
              <pv-input-number
                  id="height"
                  v-model="form.height"
                  :min="0"
                  :max-fraction-digits="2"
                  :class="{ 'p-invalid': errors.height }"
                  class="w-full"
              />
              <small v-if="errors.height" class="p-error">{{ errors.height }}</small>
            </div>
          </div>

          <!-- DNI -->
          <div class="col-12 md:col-6">
            <div class="field">
              <label for="dni" class="block mb-2">{{ t('senior-citizen.dni') }}:</label>
              <pv-input-text
                  id="dni"
                  v-model="form.dni"
                  :class="{ 'p-invalid': errors.dni }"
                  class="w-full"
              />
              <small v-if="errors.dni" class="p-error">{{ errors.dni }}</small>
            </div>
          </div>

          <!-- Device ID -->
          <div class="col-12 md:col-6">
            <div class="field">
              <label for="deviceId" class="block mb-2">{{ t('senior-citizen.deviceId') }}:</label>
              <pv-input-number
                  id="deviceId"
                  v-model="form.deviceId"
                  :min="0"
                  :class="{ 'p-invalid': errors.deviceId }"
                  class="w-full"
              />
              <small v-if="errors.deviceId" class="p-error">{{ errors.deviceId }}</small>
            </div>
          </div>

          <!-- Image URL -->
          <div class="col-12">
            <div class="field">
              <label for="imageUrl" class="block mb-2">
                {{ t('senior-citizen.imageUrl') }} ({{ t('senior-citizen.imageUrlHint') }}):
              </label>
              <pv-input-text
                  id="imageUrl"
                  v-model="form.imageUrl"
                  type="url"
                  :placeholder="t('senior-citizen.imageUrlPlaceholder')"
                  :class="{ 'p-invalid': errors.imageUrl }"
                  class="w-full"
              />
              <small v-if="errors.imageUrl" class="p-error">{{ errors.imageUrl }}</small>
            </div>
          </div>

          <!-- Image Preview -->
          <div v-if="form.imageUrl && !errors.imageUrl" class="col-12">
            <div class="field">
              <label class="block mb-2">{{ t('senior-citizen.preview') }}:</label>
              <img
                  :src="form.imageUrl"
                  :alt="t('senior-citizen.photo')"
                  class="preview-image"
                  style="max-width: 200px; max-height: 200px; border-radius: 8px;"
                  @error="$event.target.src='/assets/default-senior-citizen.png'"
              />
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex gap-2 mt-4">
          <pv-button
              type="submit"
              :label="t('senior-citizen.save')"
              icon="pi pi-check"
              class="p-button-success"
          />
          <pv-button
              type="button"
              :label="t('senior-citizen.cancel')"
              icon="pi pi-times"
              class="p-button-secondary"
              @click="onCancel"
          />
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.form-container {
  max-width: 1200px;
}

.preview-image {
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
