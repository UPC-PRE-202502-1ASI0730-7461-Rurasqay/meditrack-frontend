<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useRegistrationFlowStore } from '../../application/registration-flow.store.js';
import { useIAMStore } from '../../application/iam.store.js';
import { SignUpCommand } from '../../domain/model/sign-up.command.js';
import {useI18n} from "vue-i18n";
import LanguageSwitcher from '../../../shared/presentation/components/language-switcher.vue';

const router = useRouter();
const route = useRoute();
const registrationFlow = useRegistrationFlowStore();
const iamStore = useIAMStore();

const { t } = useI18n();

// Form state
const cardNumber = ref('');
const expirationDate = ref('');
const securityCode = ref('');
const password = ref('');
const confirmPassword = ref('');

const touched = ref({
  cardNumber: false,
  expirationDate: false,
  securityCode: false,
  password: false,
  confirmPassword: false
});

const hidePassword = ref(true);
const hideConfirmPassword = ref(true);
const submitting = ref(false);
const errors = ref([]);

function setTouched(field) {
  touched.value[field] = true;
}

function validateCardNumber(value) {
  if (!value) return { valid: false, error: 'required' };
  const cleaned = value.replace(/\s/g, '');
  if (!/^\d+$/.test(cleaned) || cleaned.length < 13 || cleaned.length > 19) return { valid: false, error: 'invalid' };
  return { valid: true };
}

function validateExpirationDate(value) {
  if (!value) return { valid: false, error: 'required' };
  const pattern = /^(0[1-9]|1[0-2])\/\d{2}$/;
  if (!pattern.test(value)) return { valid: false, error: 'invalid' };
  return { valid: true };
}

function validateSecurityCode(value) {
  if (!value) return { valid: false, error: 'required' };
  if (!/^\d{3,4}$/.test(value)) return { valid: false, error: 'invalid' };
  return { valid: true };
}

function validatePassword(value) {
  if (!value) return { valid: false, error: 'required' };
  if (value.length < 6) return { valid: false, error: 'minlength' };
  return { valid: true };
}

function passwordsMatch(pw, cpw) {
  if (!cpw) return { valid: false, error: 'required' };
  return pw === cpw ? { valid: true } : { valid: false, error: 'mismatch' };
}

function onCardNumberInput(event) {
  let value = event.target.value.replace(/\s/g, '');
  value = value.replace(/\D/g, '');
  cardNumber.value = (value.match(/.{1,4}/g) || []).join(' ') || value;
}

function onExpirationDateInput(event) {
  let value = event.target.value.replace(/\D/g, '');
  if (value.length > 4) value = value.substring(0, 4);
  if (value.length >= 3) {
    value = value.substring(0,2) + '/' + value.substring(2);
  }
  expirationDate.value = value;
}

function togglePasswordVisibility() {
  hidePassword.value = !hidePassword.value;
}

function toggleConfirmPasswordVisibility() {
  hideConfirmPassword.value = !hideConfirmPassword.value;
}

function goBack() {
  router.push({ path: '../subscription-selection', params: {}, query: {}, hash: '' });
}

async function onSubmit() {
  touched.value = { cardNumber: true, expirationDate: true, securityCode: true, password: true, confirmPassword: true };
  errors.value = [];

  const cnum = validateCardNumber(cardNumber.value);
  const exp = validateExpirationDate(expirationDate.value);
  const scode = validateSecurityCode(securityCode.value);
  const pw = validatePassword(password.value);
  const cpw = passwordsMatch(password.value, confirmPassword.value);

  if (!cnum.valid || !exp.valid || !scode.valid || !pw.valid || !cpw.valid) {
     if (!cnum.valid) errors.value.push('cardNumber');
    if (!exp.valid) errors.value.push('expirationDate');
    if (!scode.valid) errors.value.push('securityCode');
    if (!pw.valid) errors.value.push('password');
    if (!cpw.valid) errors.value.push('confirmPassword');
    return;
  }


  submitting.value = true;
  try {
    const role = registrationFlow.role;
    if (!role) {
      router.push('/auth/login');
      return;
    }

    if (role === 'relative') {
       const cmd = SignUpCommand.fromRegistrationFlow({
        email: registrationFlow.email,
        password: registrationFlow.password,
        role: registrationFlow.role,
        planType: registrationFlow.planType
      });

       cmd.setPaymentInfo({ provider: 'mock', receiptId: 'mock_receipt', confirmed: true });

      await iamStore.signUp(cmd);

       registrationFlow.setPlanType('premium');

      router.push({ name: 'senior-citizen-registration', params: {}, query: {}, hash: '' });

    } else if (role === 'admin') {

      const cmd = SignUpCommand.fromRegistrationFlow({
        email: registrationFlow.email,
        password: registrationFlow.password,
        role: registrationFlow.role,
        adminFirstName: registrationFlow.adminFirstName,
        adminLastName: registrationFlow.adminLastName,
        institutionName: registrationFlow.institutionName,
        institutionType: registrationFlow.institutionType
      });

      cmd.setPaymentInfo({ provider: 'mock', receiptId: 'mock_receipt', confirmed: true });

      await iamStore.signUp(cmd);

      registrationFlow.clear();
      //
      router.push('/auth/login');
    } else {
      router.push('/auth/login');
    }
  } catch (err) {
    console.error('Error on billing submit', err);
    errors.value.push(err.message || String(err));
  } finally {
    submitting.value = false;
  }
}

</script>

<template>
  <div class="billing-container">
    <pv-card class="billing-card">
      <template #header>
        <div class="card-header-section">
          <pv-button
            icon="pi pi-arrow-left"
            class="back-button"
            text
            rounded
            @click="goBack"
          />
          <div class="plan-badge">
            <pv-tag 
              :value="registrationFlow.planType ? registrationFlow.planType.toUpperCase() : 'PREMIUM'" 
              severity="success" 
              size="large"
            />
          </div>
        </div>
      </template>
      <template #title>
        <h2 class="billing-title">{{ t('billingInformation.title') }}</h2>
        <p class="billing-subtitle">{{ t('billingInformation.subtitle') }}</p>
      </template>
      <template #content>
        <form class="billing-form" @submit.prevent="onSubmit">
          <div class="card-info-section">
            <h3 class="section-title">
              <i class="pi pi-credit-card"></i>
              {{ t('billingInformation.card') }}
            </h3>
          </div>

          <div class="form-field">
            <pv-float-label>
              <pv-input-text
                id="card-number"
                v-model="cardNumber"
                @input="onCardNumberInput"
                maxlength="19"
                class="w-full"
                :class="{ 'p-invalid': touched.cardNumber && validateCardNumber(cardNumber).error }"
                @blur="setTouched('cardNumber')"
              />
              <label for="card-number">{{ t('billingInformation.cardNumber') }}</label>
            </pv-float-label>
            <small v-if="touched.cardNumber && validateCardNumber(cardNumber).error" class="p-error">
              <span v-if="validateCardNumber(cardNumber).error === 'required'">{{ t('billingInformation.errors.cardNumberRequired')}}</span>
              <span v-else>{{ t('billingInformation.errors.invalidCardNumber')}}</span>
            </small>
          </div>

          <div class="form-row">
            <div class="form-field">
              <pv-float-label>
                <pv-input-text
                  id="expiration-date"
                  v-model="expirationDate"
                  @input="onExpirationDateInput"
                  maxlength="5"
                  class="w-full"
                  :class="{ 'p-invalid': touched.expirationDate && validateExpirationDate(expirationDate).error }"
                  @blur="setTouched('expirationDate')"
                />
                <label for="expiration-date">{{ t('billingInformation.expirationDate') }}</label>
              </pv-float-label>
              <small v-if="touched.expirationDate && validateExpirationDate(expirationDate).error" class="p-error">
                <span v-if="validateExpirationDate(expirationDate).error === 'required'">{{ t('billingInformation.errors.expirationDateRequired')}}</span>
                <span v-else>{{ t('billingInformation.errors.invalidExpirationDate')}}</span>
              </small>
            </div>

            <div class="form-field">
              <pv-float-label>
                <pv-input-text
                  id="security-code"
                  v-model="securityCode"
                  maxlength="4"
                  class="w-full"
                  :class="{ 'p-invalid': touched.securityCode && validateSecurityCode(securityCode).error }"
                  @blur="setTouched('securityCode')"
                />
                <label for="security-code">{{ t('billingInformation.securityCode') }}</label>
              </pv-float-label>
              <small v-if="touched.securityCode && validateSecurityCode(securityCode).error" class="p-error">
                {{ t('billingInformation.errors.securityCodeRequired')}}
              </small>
            </div>
          </div>

          <pv-divider />

          <div class="form-field">
            <pv-float-label>
              <pv-password
                id="password"
                v-model="password"
                toggleMask
                :feedback="false"
                class="w-full"
                :class="{ 'p-invalid': touched.password && validatePassword(password).error }"
                @blur="setTouched('password')"
              />
              <label for="password">{{ t('billingInformation.password') }}</label>
            </pv-float-label>
            <small v-if="touched.password && validatePassword(password).error" class="p-error">
              {{ t('billingInformation.errors.passwordRequired')}}
            </small>
          </div>

          <div class="form-field">
            <pv-float-label>
              <pv-password
                id="confirm-password"
                v-model="confirmPassword"
                toggleMask
                :feedback="false"
                class="w-full"
                :class="{ 'p-invalid': touched.confirmPassword && passwordsMatch(password, confirmPassword).error }"
                @blur="setTouched('confirmPassword')"
              />
              <label for="confirm-password">{{ t('billingInformation.confirmPassword') }}</label>
            </pv-float-label>
            <small v-if="touched.confirmPassword && passwordsMatch(password, confirmPassword).error" class="p-error">
              <span v-if="passwordsMatch(password, confirmPassword).error === 'required'">{{ t('billingInformation.errors.confirmPasswordRequired')}}</span>
              <span v-else>{{ t('billingInformation.errors.passwordMismatch')}}</span>
            </small>
          </div>

          <pv-message v-if="errors.length" severity="error" :closable="false">
            <div v-for="(err, idx) in errors" :key="idx">{{ err }}</div>
          </pv-message>

          <pv-button
            type="submit"
            :label="t('billingInformation.startButton')"
            :loading="submitting"
            :disabled="submitting"
            class="w-full mt-3"
            size="large"
          />
        </form>
      </template>
    </pv-card>
  </div>
</template>

<style scoped>
.billing-container {
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

.billing-card {
    width: 100%;
    max-width: 600px;
}

.card-header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.back-button {
    color: white !important;
}

.plan-badge {
    display: flex;
    align-items: center;
}

.billing-title {
    font-size: 2rem;
    font-weight: 600;
    color: #333;
    text-align: center;
    margin-bottom: 0.5rem;
}

.billing-subtitle {
    font-size: 1rem;
    color: #666;
    text-align: center;
    margin-bottom: 0;
}

.card-info-section {
    margin-bottom: 1.5rem;
}

.section-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #333;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.section-title i {
    color: #667eea;
}

.billing-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.form-field {
    width: 100%;
}

@media (max-width: 768px) {
    .form-row {
        grid-template-columns: 1fr;
    }
    
    .billing-container {
        padding: 1rem;
    }
}
</style>