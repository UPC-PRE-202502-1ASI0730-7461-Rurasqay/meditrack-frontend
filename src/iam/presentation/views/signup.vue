<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useRegistrationFlowStore } from '../../application/registration-flow.store.js';
import logo from '../../../assets/logo1.png';
import {useI18n} from "vue-i18n";

const router = useRouter();
const route = useRoute();
const registrationFlow = useRegistrationFlowStore();

const { t } = useI18n();

// Form state
const firstName = ref('');
const lastName = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');

const hidePassword = ref(true);
const hideConfirmPassword = ref(true);
const isLoading = ref(false);
const errorMessage = ref(null);

const selectedRole = ref('user');

onMounted(() => {
  const roleFromQuery = route.query.role;
  if (roleFromQuery) {
    selectedRole.value = String(roleFromQuery).toLowerCase();
  } else {
    // If no role provided, redirect to user-type-selection
    router.push({ name: 'user-type-selection' }).catch(() => {
      router.push('/auth/user-type-selection').catch(() => {});
    });
  }
});

function togglePasswordVisibility() {
  hidePassword.value = !hidePassword.value;
}
function toggleConfirmPasswordVisibility() {
  hideConfirmPassword.value = !hideConfirmPassword.value;
}

function validateEmail(val) {
  if (!val) return false;
  const re = /^\S+@\S+\.\S+$/;
  return re.test(val);
}

function passwordsMatch() {
  return password.value === confirmPassword.value;
}

function isFormValid() {
  return (
    firstName.value.trim().length > 0 &&
    lastName.value.trim().length > 0 &&
    validateEmail(email.value) &&
    password.value.length >= 6 &&
    confirmPassword.value.length >= 6 &&
    passwordsMatch()
  );
}

async function onSubmit() {
  errorMessage.value = null;
  if (!isFormValid()) {
    errorMessage.value = 'signup.errors.invalidForm';
    return;
  }

  isLoading.value = true;
  try {
    const normalizedRole = (selectedRole.value || 'user').toLowerCase().trim();

    // Save data to registration flow (password kept in memory)
    registrationFlow.setUserData(email.value, password.value, normalizedRole);
    if (normalizedRole === 'admin') {
      registrationFlow.setAdminData(firstName.value.trim(), lastName.value.trim());
    }

    // Redirect to subscription selection, pass role as query param as fallback
    await router.push({ name: 'subscription-selection', query: { role: normalizedRole } });
  } catch (err) {
    console.error('[Signup] submit error', err);
    errorMessage.value = 'signup.errors.failed';
  } finally {
    isLoading.value = false;
  }
}

function navigateToSignIn(event) {
  if (event && event.preventDefault) event.preventDefault();
  router.push({ name: 'login' }).catch(() => router.push('/auth/login'));
}
</script>

<template>
  <div class="signup-container">
    <div class="signup-card">
      <h1 class="welcome-title">{{ t('signup.title') }}</h1>

      <div class="logo-container">
        <img :src="logo" alt="MediTrack Logo" class="logo" />
      </div>

      <form class="signup-form" @submit.prevent="onSubmit">
        <div class="form-field">
          <input class="full-width" type="text" v-model="firstName" :placeholder="t('signup.firstNamePlaceholder')" />
        </div>

        <div class="form-field">
          <input class="full-width" type="text" v-model="lastName" :placeholder="t('signup.lastNamePlaceholder')" />
        </div>

        <div class="form-field">
          <input class="full-width" type="email" v-model="email" :placeholder="t('signup.emailPlaceholder')" />
        </div>

        <div class="form-field">
          <div style="position:relative;">
            <input class="full-width" :type="hidePassword ? 'password' : 'text'" v-model="password" :placeholder="t('signup.passwordPlaceholder')" />
            <button type="button" @click="togglePasswordVisibility" style="position:absolute;right:8px;top:8px;">{{ hidePassword ? '👁️‍🗨️' : '👁️' }}</button>
          </div>
        </div>

        <div class="form-field">
          <div style="position:relative;">
            <input class="full-width" :type="hideConfirmPassword ? 'password' : 'text'" v-model="confirmPassword" :placeholder="t('signup.confirmPasswordPlaceholder')" />
            <button type="button" @click="toggleConfirmPasswordVisibility" style="position:absolute;right:8px;top:8px;">{{ hideConfirmPassword ? '👁️‍🗨️' : '👁️' }}</button>
          </div>
        </div>

        <div v-if="errorMessage" class="error-message">{{ t(errorMessage) }}</div>

        <button class="signup-button" type="submit" :disabled="isLoading || !isFormValid()">
          <span v-if="isLoading" class="spinner-icon">⏳</span>
          <span v-if="isLoading">{{ t('signup.registering') }}</span>
          <span v-else>{{ t('signup.continueButton') }}</span>
        </button>
      </form>

      <div class="signin-container">
        <span class="signin-text">{{ t('signup.haveAccount') }}</span>
        <a href="#" class="signin-link" @click="navigateToSignIn">{{ t('signup.signIn') }}</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.signup-container {     display: flex;     justify-content: center;     align-items: center;     min-height: 100%;     padding: 20px; }
.signup-card {     background-color: white;     border-radius: 8px;     padding: 40px;     width: 100%;     max-width: 450px;     box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);     display: flex;     flex-direction: column;     align-items: center; }
.welcome-title {     font-size: 1.75rem;     font-weight: 500;     color: #333;     margin-bottom: 30px;     text-align: center; }
.logo-container {     margin-bottom: 30px;     display: flex;     justify-content: center;     align-items: center; }
.logo {     height: 80px;     width: auto; }
.signup-form {     width: 100%;     display: flex;     flex-direction: column;     gap: 20px; }
.form-field {     width: 100%; }
.full-width {     width: 100%; }
.error-message {     background-color: #fee;     color: #c33;     padding: 12px;     border-radius: 4px;     font-size: 0.875rem;     text-align: center;     border: 1px solid #fcc; }
.signup-button {     width: 100%;     background-color: #0C7BB5;     color: white;     padding: 12px;     font-size: 1rem;     font-weight: 500;     margin-top: 10px;     transition: background-color 0.2s; }
.signup-button:hover:not(:disabled) {     background-color: #0a6a9a; }
.signup-button:disabled {     background-color: #ccc;     cursor: not-allowed; }
.spinner-icon {     animation: spin 1s linear infinite;     margin-right: 8px; }
@keyframes spin {     from {         transform: rotate(0deg);     }     to {         transform: rotate(360deg);     } }
.signin-container {     margin-top: 30px;     text-align: center;     font-size: 0.875rem;     color: #666; }
.signin-text {     margin-right: 5px; }
.signin-link {     color: #0C7BB5;     text-decoration: none;     font-weight: 500;     cursor: pointer;     transition: color 0.2s; }
.signin-link:hover {     color: #0a6a9a;     text-decoration: underline; }
</style>