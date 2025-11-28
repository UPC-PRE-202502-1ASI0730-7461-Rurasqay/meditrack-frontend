<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useRegistrationFlowStore } from '../../application/registration-flow.store.js';
import { useIAMStore } from '../../application/iam.store.js';
import { SingUpCommand } from '../../domain/model/sing-up.command.js';
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
       const cmd = SingUpCommand.fromRegistrationFlow({
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

      const cmd = SingUpCommand.fromRegistrationFlow({
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
    <div class="billing-card">
      <div class="card-top">
        <button class="back-button" @click="goBack" :aria-label="t('common.back')">←</button>
        <div class="card-header">
          <div class="plan-info">
            <div class="plan-name">{{ t('billingInformation.plan') }}</div>
            <div class="plan-value">{{ registrationFlow.planType ? registrationFlow.planType.toUpperCase() : t('subscriptionSelection.fremium') }}</div>
          </div>
          <div class="language-switcher-wrapper">
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      <h1 class="title">{{ t('billingInformation.title') }}</h1>

      <div class="card-section">
        <span class="card-label">{{ t('billingInformation.card') }}</span>
      </div>

      <form class="billing-form" @submit.prevent="onSubmit">
        <div class="form-field">
          <label for="card-number" class="input-label">{{ t('billingInformation.cardNumber') }}</label>
          <input id="card-number" aria-label="{{ t('billingInformation.cardNumber') }}" class="full-width" type="text" v-model="cardNumber" @input="onCardNumberInput" maxlength="19" :placeholder="t('billingInformation.cardNumberPlaceholder')" @blur="setTouched('cardNumber')" />
          <div v-if="touched.cardNumber && validateCardNumber(cardNumber).error" class="error-text">
            <span v-if="validateCardNumber(cardNumber).error === 'required'">{{ t('billingInformation.errors.cardNumberRequired')}}</span>
            <span v-else>{{t('billingInformation.errors.invalidCardNumber')}}</span>
          </div>
        </div>

        <div class="form-field">
          <label for="expiration-date" class="input-label">{{ t('billingInformation.expirationDate') }}</label>
          <input id="expiration-date" aria-label="{{ t('billingInformation.expirationDate') }}" class="full-width" type="text" v-model="expirationDate" @input="onExpirationDateInput" maxlength="5" :placeholder="t('billingInformation.expirationDatePlaceholder')" @blur="setTouched('expirationDate')" />
          <div v-if="touched.expirationDate && validateExpirationDate(expirationDate).error" class="error-text">
            <span v-if="validateExpirationDate(expirationDate).error === 'required'">{{t('billingInformation.errors.expirationDateRequired')}}</span>
            <span v-else>{{t('billingInformation.errors.invalidExpirationDate')}}</span>
          </div>
        </div>

        <div class="form-field">
          <label for="security-code" class="input-label">{{ t('billingInformation.securityCode') }}</label>
          <input id="security-code" aria-label="{{ t('billingInformation.securityCode') }}" class="full-width" type="text" v-model="securityCode" maxlength="4" :placeholder="t('billingInformation.securityCodePlaceholder')" @blur="setTouched('securityCode')" />
          <div v-if="touched.securityCode && validateSecurityCode(securityCode).error" class="error-text">
            <span>{{t('billingInformation.errors.securityCodeRequired')}}</span>
          </div>
        </div>

        <div class="form-field">
          <label for="password" class="input-label">{{ t('billingInformation.password') }}</label>
          <div style="position:relative;">
            <input id="password" aria-label="{{ t('billingInformation.password') }}" class="full-width" :type="hidePassword ? 'password' : 'text'" v-model="password" :placeholder="t('billingInformation.passwordPlaceholder')" @blur="setTouched('password')" />
            <button type="button" @click="togglePasswordVisibility" style="position:absolute;right:8px;top:8px;">{{ hidePassword ? '👁️‍🗨️' : '👁️' }}</button>
          </div>
          <div v-if="touched.password && validatePassword(password).error" class="error-text">
            <span>{{t('billingInformation.errors.passwordRequired')}}</span>
          </div>
        </div>

        <div class="form-field">
          <label for="confirm-password" class="input-label">{{ t('billingInformation.confirmPassword') }}</label>
          <div style="position:relative;">
            <input id="confirm-password" aria-label="{{ t('billingInformation.confirmPassword') }}" class="full-width" :type="hideConfirmPassword ? 'password' : 'text'" v-model="confirmPassword" :placeholder="t('billingInformation.confirmPasswordPlaceholder')" @blur="setTouched('confirmPassword')" />
            <button type="button" @click="toggleConfirmPasswordVisibility" style="position:absolute;right:8px;top:8px;">{{ hideConfirmPassword ? '👁️‍🗨️' : '👁️' }}</button>
          </div>
          <div v-if="touched.confirmPassword && passwordsMatch(password, confirmPassword).error" class="error-text">
            <span v-if="passwordsMatch(password, confirmPassword).error === 'required'">{{t('billingInformation.errors.confirmPasswordRequired')}}</span>
            <span v-else>{{t('billingInformation.errors.passwordMismatch')}}</span>
          </div>
        </div>

        <button class="start-button" :disabled="submitting">{{t('billingInformation.startButton')}}</button>
      </form>

      <div v-if="errors.length" style="margin-top:12px;color:#b00020;">
        <div v-for="(err, idx) in errors" :key="idx">{{ err }}</div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.billing-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100%;
    padding: 20px;
}

.billing-card {
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

.card-top {
    display:flex;
    align-items:center;
    justify-content:space-between;
    margin-bottom:8px;
}

.card-header {
    display:flex;
    align-items:center;
    justify-content:space-between;
    width:100%;
}

.plan-info {
    display:flex;
    flex-direction:column;
}

.plan-name {
    font-size:0.85rem;
    color:#666;
}

.plan-value {
    font-weight:600;
    color:#0C7BB5;
}

.language-switcher-wrapper {
    display:flex;
    align-items:center;
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

.card-section {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 20px;
    color: #333;
    font-weight: 500;
}

.card-icon {
    color: #666;
}

.card-label {
    font-size: 1rem;
}

.billing-form {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.form-field {
    width: 100%;
}

.input-label {
    font-size: 0.875rem;
    color: #333;
    margin-bottom: 8px;
    display: block;
}

.full-width {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
}

.terms-text {
    font-size: 0.875rem;
    color: #666;
    line-height: 1.5;
    margin: 10px 0;
    text-align: center;
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

.error-text {
    color: #b00020;
    font-size: 0.875rem;
    margin-top: 6px;
}

</style>