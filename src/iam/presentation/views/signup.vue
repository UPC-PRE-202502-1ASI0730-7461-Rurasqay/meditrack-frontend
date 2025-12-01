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
const emailError = ref(null);
const checkingEmail = ref(false);

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
    !emailError.value &&
    password.value.length >= 6 &&
    confirmPassword.value.length >= 6 &&
    passwordsMatch()
  );
}

async function checkEmailAvailability() {
  if (!validateEmail(email.value)) {
    emailError.value = null;
    return;
  }

  checkingEmail.value = true;
  emailError.value = null;

  try {
    // Try to check if email exists by attempting a lightweight check
    // You can use the IAM store or API directly
    const { useIAMStore } = await import('../../application/iam.store.js');
    const iamStore = useIAMStore();
    
    // Simple check: try to sign up with the email to see if it's taken
    // If you have a dedicated endpoint, use that instead
    // For now, we'll just clear the error and let the actual signup handle it
    emailError.value = null;
  } catch (err) {
    const status = err?.response?.status;
    if (status === 409 || status === 500) {
      emailError.value = 'signup.errors.emailTaken';
    }
  } finally {
    checkingEmail.value = false;
  }
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
    const status = err?.response?.status;
    if (status === 409 || status === 500) {
      emailError.value = 'signup.errors.emailTaken';
      errorMessage.value = 'signup.errors.emailTaken';
    } else {
      errorMessage.value = 'signup.errors.failed';
    }
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
    <pv-card class="signup-card">
      <template #header>
        <div class="card-header">
          <img :src="logo" alt="MediTrack Logo" class="logo" />
        </div>
      </template>
      <template #title>
        <h2 class="signup-title">{{ t('signup.title') }}</h2>
        <p class="signup-subtitle">{{ t('signup.subtitle') }}</p>
      </template>
      <template #content>
        <form class="signup-form" @submit.prevent="onSubmit">
          <div class="form-row">
            <div class="form-field">
              <pv-float-label>
                <pv-input-text
                  id="firstName"
                  v-model="firstName"
                  class="w-full"
                />
                <label for="firstName">{{ t('signup.firstNamePlaceholder') }}</label>
              </pv-float-label>
            </div>

            <div class="form-field">
              <pv-float-label>
                <pv-input-text
                  id="lastName"
                  v-model="lastName"
                  class="w-full"
                />
                <label for="lastName">{{ t('signup.lastNamePlaceholder') }}</label>
              </pv-float-label>
            </div>
          </div>

          <div class="form-field">
            <pv-float-label>
              <pv-input-text
                id="email"
                v-model="email"
                type="email"
                class="w-full"
                :class="{ 'p-invalid': emailError }"
                @blur="checkEmailAvailability"
              />
              <label for="email">{{ t('signup.emailPlaceholder') }}</label>
            </pv-float-label>
            <small v-if="checkingEmail" class="p-info">
              <i class="pi pi-spin pi-spinner"></i> {{ t('signup.checkingEmail') }}
            </small>
            <small v-else-if="emailError" class="p-error">
              {{ t(emailError) }}
            </small>
          </div>

          <div class="form-field">
            <pv-float-label>
              <pv-password
                id="password"
                v-model="password"
                toggleMask
                class="w-full"
                :feedback="true"
              />
              <label for="password">{{ t('signup.passwordPlaceholder') }}</label>
            </pv-float-label>
          </div>

          <div class="form-field">
            <pv-float-label>
              <pv-password
                id="confirmPassword"
                v-model="confirmPassword"
                toggleMask
                :feedback="false"
                class="w-full"
              />
              <label for="confirmPassword">{{ t('signup.confirmPasswordPlaceholder') }}</label>
            </pv-float-label>
          </div>

          <pv-message v-if="errorMessage" severity="error" :closable="false">
            {{ t(errorMessage) }}
          </pv-message>

          <pv-button
            type="submit"
            :label="isLoading ? t('signup.registering') : t('signup.continueButton')"
            :loading="isLoading"
            :disabled="!isFormValid()"
            class="w-full mt-3"
            size="large"
          />
        </form>

        <div class="signin-container">
          <span class="signin-text">{{ t('signup.haveAccount') }}</span>
          <pv-button 
            :label="t('signup.signIn')" 
            link 
            @click="navigateToSignIn"
            class="signin-link"
          />
        </div>
      </template>
    </pv-card>
  </div>
</template>

<style scoped>
.signup-container {
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
}

.signup-card {
    width: 100%;
    max-width: 600px;
}

.card-header {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.logo {
    height: 80px;
    width: auto;
    filter: brightness(0) invert(1);
}

.signup-title {
    font-size: 2rem;
    font-weight: 600;
    color: #333;
    text-align: center;
    margin-bottom: 0.5rem;
}

.signup-subtitle {
    font-size: 1rem;
    color: #666;
    text-align: center;
    margin-bottom: 0;
}

.signup-form {
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

.signin-container {
    margin-top: 2rem;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
}

.signin-text {
    color: #666;
    font-size: 0.95rem;
}

.signin-link {
    font-weight: 600;
}

@media (max-width: 768px) {
    .form-row {
        grid-template-columns: 1fr;
    }
    
    .signup-container {
        padding: 1rem;
    }
}
</style>