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

    const email = (userRef && (userRef.email ?? userRef.value?.email)) ? (userRef.email ?? userRef.value?.email) : 'user@example.com';
    const emailName = email.split('@')[0];
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
    router.push(`/relative/${userId}`);

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
    <pv-card class="form-card">
      <template #header>
        <div class="card-header">
          <h1 class="main-title">{{ t('senior-citizen-registration.title') }}</h1>
          <p class="main-subtitle">{{ t('senior-citizen-registration.subtitle') }}</p>
        </div>
      </template>
      <template #content>
        <form class="registration-form" @submit.prevent="onSubmit">
          <div class="form-content">
            <pv-card class="section-card">
              <template #title>
                <h3 class="section-title">
                  <i class="pi pi-user"></i>
                  {{ t('senior-citizen-registration.personalDetails') }}
                </h3>
              </template>
              <template #content>
                <div class="form-fields">
                  <div class="form-field">
                    <label for="fullName" class="field-label">{{ t('senior-citizen-registration.fullName') }}</label>
                    <pv-input-text
                      id="fullName"
                      v-model="fullName"
                      class="w-full"
                    />
                  </div>

                  <div class="form-row">
                    <div class="form-field">
                      <label for="age" class="field-label">{{ t('senior-citizen-registration.age') }}</label>
                      <pv-input-number
                        id="age"
                        v-model="age"
                        class="w-full"
                        :min="0"
                        :max="150"
                      />
                    </div>

                    <div class="form-field">
                      <label for="gender" class="field-label">{{ t('senior-citizen-registration.gender.label') }}</label>
                      <pv-select
                        id="gender"
                        v-model="gender"
                        :options="genderOptions"
                        optionLabel="label"
                        optionValue="value"
                        class="w-full"
                        :placeholder="t('senior-citizen-registration.gender.placeholder')"
                      >
                        <template #value="slotProps">
                          <span v-if="slotProps.value">{{ t(genderOptions.find(o => o.value === slotProps.value)?.label) }}</span>
                          <span v-else>{{ t('senior-citizen-registration.gender.placeholder') }}</span>
                        </template>
                        <template #option="slotProps">
                          {{ t(slotProps.option.label) }}
                        </template>
                      </pv-select>
                    </div>
                  </div>

                  <div class="form-field">
                    <label for="dni" class="field-label">{{ t('senior-citizen-registration.dni') }}</label>
                    <pv-input-text
                      id="dni"
                      v-model="dni"
                      class="w-full"
                    />
                  </div>

                  <div class="form-row">
                    <div class="form-field">
                      <label for="weight" class="field-label">{{ t('senior-citizen-registration.weight') }}</label>
                      <pv-input-number
                        id="weight"
                        v-model="weight"
                        class="w-full"
                        :min="0"
                        suffix=" kg"
                      />
                    </div>

                    <div class="form-field">
                      <label for="height" class="field-label">{{ t('senior-citizen-registration.height') }}</label>
                      <pv-input-number
                        id="height"
                        v-model="height"
                        class="w-full"
                        :min="0"
                        suffix=" cm"
                      />
                    </div>
                  </div>

                  <div class="form-field">
                    <label for="deviceId" class="field-label">{{ t('senior-citizen-registration.deviceId') }}</label>
                    <pv-input-number
                      id="deviceId"
                      v-model="deviceId"
                      class="w-full"
                      :min="0"
                      :useGrouping="false"
                    />
                  </div>
                </div>
              </template>
            </pv-card>

            <pv-card class="section-card">
              <template #title>
                <h3 class="section-title">
                  <i class="pi pi-image"></i>
                  {{ t('senior-citizen-registration.uploadPhoto') }}
                </h3>
              </template>
              <template #content>
                <div class="photo-section">
                  <div class="form-field">
                    <label for="imageUrl" class="field-label">{{ t('senior-citizen.imageUrlPlaceholder') }}</label>
                    <pv-input-text
                      id="imageUrl"
                      v-model="imageUrl"
                      class="w-full"
                      type="url"
                    />
                  </div>

                  <div v-if="imageUrl && validateImageUrl(imageUrl)" class="preview">
                    <p class="preview-title">{{ t('senior-citizen.preview') }}</p>
                    <pv-image 
                      :src="imageUrl" 
                      :alt="t('senior-citizen.photo')" 
                      class="preview-image"
                      preview
                    />
                  </div>
                  <p v-else-if="imageUrl && !validateImageUrl(imageUrl)" class="error-text">
                    {{ t('senior-citizen-registration.errors.invalidImageUrl') }}
                  </p>
                </div>
              </template>
            </pv-card>
          </div>

          <pv-message v-if="errorMessage" severity="error" :closable="false">
            {{ t(errorMessage) }}
          </pv-message>

          <div class="form-actions">
            <pv-button
              type="submit"
              :label="t('senior-citizen-registration.save')"
              icon="pi pi-arrow-right"
              iconPos="right"
              :loading="isLoading"
              :disabled="isLoading || !isFormValid()"
              size="large"
              class="save-button"
            />
          </div>
        </form>
      </template>
    </pv-card>
  </div>
</template>

<style scoped>
.registration-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
    overflow-y: auto;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.form-card {
    width: 100%;
    max-width: 1200px;
}

.card-header {
    padding: 2rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    text-align: center;
}

.main-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: white;
    margin-bottom: 0.5rem;
}

.main-subtitle {
    font-size: 1.125rem;
    color: rgba(255, 255, 255, 0.9);
    margin: 0;
}

.registration-form {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.form-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
}

.section-card {
    height: 100%;
}

.section-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1.25rem;
    font-weight: 600;
    color: #333;
    margin: 0;
}

.section-title i {
    color: #667eea;
}

.form-fields {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.form-field {
    width: 100%;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.photo-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.preview {
    text-align: center;
}

.preview-title {
    margin: 0 0 1rem 0;
    font-size: 1rem;
    color: #666;
    font-weight: 600;
}

.preview-image {
    max-width: 100%;
    border-radius: 8px;
}

.form-actions {
    display: flex;
    justify-content: center;
}

.save-button {
    min-width: 200px;
}

.field-label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: #495057;
}

.error-text {
    color: #e24c4c;
    font-size: 0.875rem;
    margin: 0.5rem 0;
}

@media (max-width: 968px) {
    .form-content {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 768px) {
    .form-row {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 600px) {
    .registration-container {
        padding: 1rem;
    }
    
    .main-title {
        font-size: 2rem;
    }
}
</style>