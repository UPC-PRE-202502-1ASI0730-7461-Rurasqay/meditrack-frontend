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
    <div class="institution-card">
      <button class="back-button" @click="goBack" aria-label="back">←</button>

      <h1 class="title">{{ t('institutionDetails.title') }}</h1>

      <form class="institution-form" @submit.prevent="onSubmit">
        <div class="form-field">
          <input
            class="full-width"
            type="text"
            v-model="institutionName"
            @blur="setTouched('institutionName')"
            :placeholder="t('institutionDetails.institutionNamePlaceholder')"
            aria-label="institution-name"
          />
          <div v-if="touched.institutionName && !isValidName()" class="error-message">
            {{ t('institutionDetails.errors.institutionNameRequired') }}
          </div>
        </div>

        <div class="institution-type-section">
          <label class="institution-type-label">{{ t('institutionDetails.institutionType') }}</label>
          <div class="institution-type-options">
            <button
              type="button"
              class="institution-type-button"
              :class="{ selected: selectedInstitutionType === 'clinic' }"
              @click="selectInstitutionType('clinic')"
            >
              <span class="icon">🏥</span>
              {{ t('institutionDetails.clinic') }}
            </button>

            <button
              type="button"
              class="institution-type-button"
              :class="{ selected: selectedInstitutionType === 'resident' }"
              @click="selectInstitutionType('resident')"
            >
              <span class="icon">🏡</span>
              {{ t('institutionDetails.residence') }}
            </button>
          </div>

          <div v-if="touched.institutionType && !isValidType()" class="error-message">
            {{ t('institutionDetails.errors.institutionTypeRequired') }}
          </div>
        </div>

        <button
          type="submit"
          class="start-button"
          :disabled="!isValidName() || !isValidType()"
        >
          {{ t('institutionDetails.startButton') }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.institution-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100%;
    padding: 20px;
}

.institution-card {
    background-color: white;
    border-radius: 8px;
    padding: 40px;
    width: 100%;
    max-width: 450px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    position: relative;
}

.back-button {
    position: absolute;
    top: 20px;
    left: 20px;
    color: #666;
    background: none;
    border: none;
    font-size: 18px;
}

.title {
    font-size: 1.75rem;
    font-weight: 500;
    color: #333;
    margin-bottom: 30px;
    text-align: center;
    margin-top: 10px;
}

.institution-form {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.form-field {
    width: 100%;
}

.full-width {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
}

.start-button {
    width: 100%;
    background-color: #0C7BB5;
    color: white;
    padding: 12px;
    font-size: 1rem;
    font-weight: 500;
    margin-top: 10px;
    transition: background-color 0.2s;
    border: none;
    border-radius: 6px;
}

.start-button:hover:not(:disabled) {
    background-color: #0a6a9a;
}

.start-button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}

.institution-type-section {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.institution-type-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.6);
    margin-bottom: 4px;
}

.institution-type-options {
    display: flex;
    gap: 16px;
    width: 100%;
}

.institution-type-button {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 16px;
    background-color: #f5f5f5;
    color: #333;
    border: 2px solid transparent;
    transition: all 0.3s ease;
    border-radius: 6px;
}

.institution-type-button:hover {
    background-color: #e8f4f8;
    border-color: #0C7BB5;
}

.institution-type-button.selected {
    background-color: #0C7BB5;
    color: white;
    border-color: #0C7BB5;
}

.institution-type-button .icon {
    font-size: 20px;
    width: 20px;
    height: 20px;
}

.error-message {
    color: #f44336;
    font-size: 0.75rem;
    margin-top: 4px;
}
</style>