<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { OrganizationApi } from '../../../organization/infrastructure/organization-api.js';
import { SeniorCitizen } from '../../../organization/domain/model/senior-citizen.entity.js';
import { useRegistrationFlowStore } from '../../application/registration-flow.store.js';
import { useIAMStore } from '../../application/iam.store.js';
import {useI18n} from "vue-i18n";

const router = useRouter();
const organizationApi = new OrganizationApi();
const registrationFlow = useRegistrationFlowStore();
const iamStore = useIAMStore();
const { t } = useI18n();

// Form fields
const fullName = ref('');
const age = ref(null);
const gender = ref('');
const dni = ref('');
const deviceId = ref(null);
const weight = ref(null);
const height = ref(null);
const imageUrl = ref('');

const isLoading = ref(false);
const errorMessage = ref(null);

const genderOptions = [
  { value: 'male', label: 'senior-citizen-registration.gender.male' },
  { value: 'female', label: 'senior-citizen-registration.gender.female' },
];


if (registrationFlow && registrationFlow.userFirstName) {

}

function validateImageUrl(url) {
  if (!url) return false;
  const pattern = /^(https?:\/\/.+\.(jpg|jpeg|png|gif|webp))(\?.*)?$/i;
  return pattern.test(url);
}

function isFormValid() {
  return (
    fullName.value && fullName.value.trim().length > 0 &&
    age.value != null && age.value >= 0 && age.value <= 150 &&
    gender.value &&
    dni.value && dni.value.trim().length > 0 &&
    deviceId.value != null && deviceId.value >= 0 &&
    weight.value != null && weight.value >= 0 &&
    height.value != null && height.value >= 0 &&
    validateImageUrl(imageUrl.value)
  );
}

async function onSubmit() {
  errorMessage.value = null;
  if (!isFormValid()) {
    errorMessage.value = 'senior-citizen-registration.errors.invalidForm';
    return;
  }

  // Ensure user is authenticated
  const userRef = iamStore.currentUser;
  // support both ref and plain object
  const userId = (userRef && (userRef.id ?? userRef.value?.id)) ? (userRef.id ?? userRef.value?.id) : null;
  if (!userId) {
    errorMessage.value = 'senior-citizen-registration.errors.authRequired';
    router.push('/auth/login');
    return;
  }

  isLoading.value = true;

  try {
    // Split fullName into firstName and lastName
    const parts = fullName.value.trim().split(/\s+/);
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ').trim() || 'N/A';

    // Calculate birthDate from age
    const today = new Date();
    const birthYear = today.getFullYear() - Number(age.value);
    const birthDate = new Date(birthYear, today.getMonth(), today.getDate()).toISOString().split('T')[0];

    // Create senior citizen with organizationId = 0 for relatives
    const senior = new SeniorCitizen({
      id: 0,
      organizationId: 0,
      firstName,
      lastName,
      birthDate,
      age: Number(age.value),
      gender: gender.value,
      weight: Number(weight.value),
      height: Number(height.value),
      dni: dni.value,
      imageUrl: imageUrl.value || '/assets/default-senior-citizen.png',
      deviceId: Number(deviceId.value),
      planType: registrationFlow.planType || 'freemium'
    });

    // Security check
    if (senior.organizationId !== 0) {
      errorMessage.value = 'senior-citizen-registration.errors.invalidConfiguration';
      isLoading.value = false;
      return;
    }

    const createResp = await organizationApi.createSeniorCitizen(senior);
    const createdSenior = (createResp && createResp.data) ? createResp.data : createResp;

    const relativesPath = import.meta.env.VITE_RELATIVES_ENDPOINT_PATH || '/relatives';

    const emailName = (currentUser && currentUser.email) ? currentUser.email.split('@')[0] : 'user';
    const nameParts = emailName.split('.');
    const relFirstName = nameParts[0] || emailName;
    const relLastName = nameParts.slice(1).join(' ') || 'N/A';

    const planType = (registrationFlow.planType || 'freemium').toUpperCase();

    const relativeData = {
      userId: userId,
      firstName: relFirstName,
      lastName: relLastName,
      phoneNumber: 'N/A',
      planType: planType,
      seniorCitizenId: createdSenior.id || createdSenior._id || createdSenior.id
    };

    await organizationApi.http.post(relativesPath, relativeData);


    registrationFlow.clear();
    router.push(`/relative/relative/${userId}`);

  } catch (err) {
    console.error('[SeniorCitizenRegistration] Error:', err);

    // Derivar mensaje de error legible
    let errorMsg = 'senior-citizen-registration.errors.failed';
    const status = err?.response?.status || err?.status;
    const errData = err?.response?.data || err?.data || err?.message || '';
    const errStr = typeof errData === 'string' ? errData : JSON.stringify(errData);

    if (errStr.includes('Duplicate entry') && (errStr.includes('device_id') || errStr.includes('deviceId'))) {
      errorMsg = 'senior-citizen-registration.errors.deviceIdInUse';
    } else if (status === 401 || status === 403) {
      errorMsg = 'senior-citizen-registration.errors.authRequired';
    } else if (status === 404) {
      errorMsg = 'senior-citizen-registration.errors.serviceNotFound';
    } else if (status === 400) {
      errorMsg = err?.response?.data?.message || 'senior-citizen-registration.errors.invalidData';
    }

    errorMessage.value = errorMsg;
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="registration-container">
    <div class="form-card">
      <form class="registration-form" @submit.prevent="onSubmit">
        <div class="form-content">

          <div class="personal-details-section section-card">
            <h3 class="section-title">{{ t('senior-citizen-registration.personalDetails') }}</h3>
            <div class="form-grid">
              <div class="form-column">
                <input class="full-width" type="text" v-model="fullName" :placeholder="t('senior-citizen-registration.fullName')" />
                <input class="full-width" type="number" v-model.number="age" :placeholder="t('senior-citizen-registration.age')" />
                <select class="full-width" v-model="gender">
                  <option value="" disabled>{{ t('senior-citizen-registration.gender.label') }}</option>
                  <option v-for="opt in genderOptions" :key="opt.value" :value="opt.value">{{ t(opt.label) }}</option>
                </select>
                <input class="full-width" type="text" v-model="dni" :placeholder="t('senior-citizen-registration.dni')" />
                <input class="full-width" type="number" v-model.number="deviceId" :placeholder="t('senior-citizen-registration.deviceId')" />
              </div>

              <div class="form-column">
                <input class="full-width" type="number" v-model.number="weight" :placeholder="t('senior-citizen-registration.weight')" />
                <input class="full-width" type="number" v-model.number="height" :placeholder="t('senior-citizen-registration.height')" />
              </div>
            </div>
          </div>

          <!-- Right: Photo URL -->
          <div class="photo-upload-section section-card">
            <h3 class="section-title">{{ t('senior-citizen-registration.uploadPhoto') }}</h3>
            <div class="photo-url-section">
              <input class="full-width" type="url" v-model="imageUrl" :placeholder="t('senior-citizen.imageUrlPlaceholder')" />

              <div v-if="validateImageUrl(imageUrl)" class="preview">
                <p class="preview-title">{{ t('senior-citizen.preview') }}</p>
                <img :src="imageUrl" :alt="t('senior-citizen.photo')" class="preview-image" @error="(e) => e.target.src='/assets/default-senior-citizen.png'" />
              </div>
            </div>
          </div>
        </div>

        <div v-if="errorMessage" class="error-message">{{ t(errorMessage) }}</div>

        <div class="form-actions">
          <button class="save-button" type="submit" :disabled="isLoading || !isFormValid()">
            <span>{{ t('senior-citizen-registration.save') }}</span>
            <span class="arrow-icon">→</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.registration-container {
    min-height: 100vh;
    background: #4A90E2;
    padding: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
}

.form-card {
    background: white;
    border-radius: 12px;
    padding: 2.5rem;
    max-width: 1200px;
    width: 100%;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.registration-form {
    display: flex;
    flex-direction: column;
}

.form-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin-bottom: 2rem;
}

.section-card {
    background: white;
    border: 1px solid #d0d0d0;
    border-radius: 8px;
    padding: 1.5rem;
    height: 100%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.section-title {
    margin: 0 0 1.5rem 0;
    font-size: 1.1rem;
    font-weight: 500;
    color: #333;
}

.form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.form-column {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.photo-upload-section {
    display: flex;
    flex-direction: column;
}

.photo-url-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.full-width {
    width: 100%;
}

.preview {
    text-align: center;
    margin-top: 1rem;
}

.preview-title {
    margin: 0 0 0.5rem 0;
    font-size: 0.9rem;
    color: #666;
    font-weight: 500;
}

.preview-image {
    max-width: 100%;
    max-height: 300px;
    border-radius: 8px;
    object-fit: contain;
    border: 1px solid #e0e0e0;
}

.form-actions {
    display: flex;
    justify-content: center;
    margin-top: 2rem;
}

.save-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.875rem 2.5rem;
    font-size: 1rem;
    font-weight: 500;
    border-radius: 8px;
    background: #4A90E2;
    color: white;
    border: none;
}

.save-button:disabled {
    background: #ccc;
    color: #666;
}

.arrow-icon {
    font-size: 20px;
    width: 20px;
    height: 20px;
}

.error-message {
    background-color: #f44336;
    color: white;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    text-align: center;
}

@media (max-width: 968px) {
    .form-content {
        grid-template-columns: 1fr;
    }
    .form-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 600px) {
    .registration-container {
        padding: 1rem;
    }
    .form-card {
        padding: 1rem;
    }
}
</style>