<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useRegistrationFlowStore } from '../../application/registration-flow.store.js';
import {useI18n} from "vue-i18n";

const router = useRouter();
const route = useRoute();
const registrationFlow = useRegistrationFlowStore();

const { t } = useI18n();

const institutionName = ref(registrationFlow.institutionName || '');
const selectedInstitutionType = ref(registrationFlow.institutionType || null);

const touched = ref({ institutionName: false, institutionType: false });

function setTouched(field) {
  touched.value[field] = true;
}

function selectInstitutionType(type) {
  selectedInstitutionType.value = type;
  setTouched('institutionType');
}

function isValidName() {
  return institutionName.value && institutionName.value.trim().length > 0;
}

function isValidType() {
  return selectedInstitutionType.value === 'clinic' || selectedInstitutionType.value === 'resident';
}

async function onSubmit() {

  setTouched('institutionName');
  setTouched('institutionType');

  if (!isValidName() || !isValidType()) {
    return;
  }


  registrationFlow.setInstitutionData(institutionName.value.trim(), selectedInstitutionType.value);

  try {
    await router.push({ name: 'billing-information' });
  } catch (e) {
    router.push('/auth/billing-information').catch(() => {});
  }
}

function goBack() {
  // Navigate back to subscription-selection relative to parent
  try {
    router.push({ name: 'subscription-selection' });
  } catch (e) {
    router.push('/auth/subscription-selection');
  }
}
</script>

<template>
  <div class="institution-container">
    <pv-card class="institution-card">
      <template #header>
        <div class="card-header">
          <pv-button
            icon="pi pi-arrow-left"
            class="back-button"
            text
            rounded
            @click="goBack"
          />
        </div>
      </template>
      <template #title>
        <h2 class="institution-title">{{ t('institutionDetails.title') }}</h2>
        <p class="institution-subtitle">{{ t('institutionDetails.subtitle') }}</p>
      </template>
      <template #content>
        <form class="institution-form" @submit.prevent="onSubmit">
          <div class="form-field">
            <pv-float-label>
              <pv-input-text
                id="institution-name"
                v-model="institutionName"
                class="w-full"
                :class="{ 'p-invalid': touched.institutionName && !isValidName() }"
                @blur="setTouched('institutionName')"
              />
              <label for="institution-name">{{ t('institutionDetails.institutionNamePlaceholder') }}</label>
            </pv-float-label>
            <small v-if="touched.institutionName && !isValidName()" class="p-error">
              {{ t('institutionDetails.errors.institutionNameRequired') }}
            </small>
          </div>

          <div class="institution-type-section">
            <label class="institution-type-label">{{ t('institutionDetails.institutionType') }}</label>
            <div class="institution-type-options">
              <pv-card
                class="institution-type-card"
                :class="{ selected: selectedInstitutionType === 'clinic' }"
                @click="selectInstitutionType('clinic')"
              >
                <template #content>
                  <div class="card-content">
                    <div class="icon-circle">
                      <span class="icon">🏥</span>
                    </div>
                    <span class="type-label">{{ t('institutionDetails.clinic') }}</span>
                  </div>
                </template>
              </pv-card>

              <pv-card
                class="institution-type-card"
                :class="{ selected: selectedInstitutionType === 'resident' }"
                @click="selectInstitutionType('resident')"
              >
                <template #content>
                  <div class="card-content">
                    <div class="icon-circle">
                      <span class="icon">🏡</span>
                    </div>
                    <span class="type-label">{{ t('institutionDetails.residence') }}</span>
                  </div>
                </template>
              </pv-card>
            </div>

            <small v-if="touched.institutionType && !isValidType()" class="p-error">
              {{ t('institutionDetails.errors.institutionTypeRequired') }}
            </small>
          </div>

          <pv-button
            type="submit"
            :label="t('institutionDetails.startButton')"
            :disabled="!isValidName() || !isValidType()"
            class="w-full mt-3"
            size="large"
          />
        </form>
      </template>
    </pv-card>
  </div>
</template>

<style scoped>
.institution-container {
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

.institution-card {
    width: 100%;
    max-width: 600px;
}

.card-header {
    padding: 1.5rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.back-button {
    color: white !important;
}

.institution-title {
    font-size: 2rem;
    font-weight: 600;
    color: #333;
    text-align: center;
    margin-bottom: 0.5rem;
}

.institution-subtitle {
    font-size: 1rem;
    color: #666;
    text-align: center;
    margin-bottom: 0;
}

.institution-form {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.form-field {
    width: 100%;
}

.institution-type-section {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.institution-type-label {
    font-size: 1rem;
    font-weight: 600;
    color: #333;
}

.institution-type-options {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
}

.institution-type-card {
    cursor: pointer;
    transition: all 0.3s ease;
    border: 2px solid transparent;
}

.institution-type-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
    border-color: #667eea;
}

.institution-type-card.selected {
    border-color: #667eea;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
}

.card-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 1rem;
    gap: 1rem;
}

.icon-circle {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.icon {
    font-size: 2.5rem;
}

.type-label {
    font-size: 1.125rem;
    font-weight: 600;
    color: #333;
}

@media (max-width: 768px) {
    .institution-container {
        padding: 1rem;
    }

    .institution-type-options {
        grid-template-columns: 1fr;
    }
}
</style>