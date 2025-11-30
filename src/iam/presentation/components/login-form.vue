<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useIAMStore } from '../../application/iam.store.js';
import { OrganizationApi } from '../../../organization/infrastructure/organization-api.js';
import {useI18n} from "vue-i18n";

const router = useRouter();
const iamStore = useIAMStore();
const organizationApi = new OrganizationApi();

const email = ref('');
const password = ref('');
const hidePassword = ref(true);
const isLoading = ref(false);
const errorMessage = ref(null);

const { t } = useI18n();

function validateEmail(value) {
  if (!value) return false;
  const re = /^\S+@\S+\.\S+$/;
  return re.test(value);
}

function validatePassword(value) {
  return typeof value === 'string' && value.length >= 6;
}

function togglePasswordVisibility() {
  hidePassword.value = !hidePassword.value;
}

async function onSubmit() {
  errorMessage.value = null;

  if (!validateEmail(email.value) || !validatePassword(password.value)) {
    errorMessage.value = 'login.errors.invalidCredentials';
    return;
  }

  isLoading.value = true;
  try {
    const resource = await iamStore.signIn({ email: email.value, password: password.value });
    if (!resource) {
      errorMessage.value = 'login.errors.invalidCredentials';
      isLoading.value = false;
      return;
    }

    const userId = resource.id ?? resource.user?.id ?? null;
    const role = resource.role ?? resource.user?.role ?? null;

    if (role === 'relative') {
      await router.push({ path: `/relative/relative/${userId}` });
      return;
    }

    if (role === 'admin') {
      try {
        const resp = await organizationApi.getAdminByUserId(String(userId));
        const data = resp && resp.data ? resp.data : resp;
        const admin = Array.isArray(data) ? (data[0] || null) : data;
        if (admin && admin.organizationId) {
          await router.push({ path: `/organization/${admin.organizationId}/admin/${userId}` });
        } else {
          errorMessage.value = 'login.errors.adminNotFound';
        }
      } catch (err) {
        console.error('Error fetching admin:', err);
        errorMessage.value = 'login.errors.adminNotFound';
      }
      return;
    }

    if (role === 'doctor') {
      try {
        const resp = await organizationApi.getDoctorByUserId(userId);
        const data = resp && resp.data ? resp.data : resp;
        const doctor = Array.isArray(data) ? (data[0] || null) : data;
        if (doctor && doctor.organizationId) {
          await router.push({ path: `/organization/${doctor.organizationId}/doctor/${userId}/senior-citizens` });
        } else {
          errorMessage.value = 'login.errors.doctorNotFound';
        }
      } catch (err) {
        console.error('Error fetching doctor:', err);
        errorMessage.value = 'login.errors.doctorNotFound';
      }
      return;
    }

    if (role === 'caregiver') {
      try {
        const resp = await organizationApi.getCaregiverByUserId(userId);
        const data = resp && resp.data ? resp.data : resp;
        const caregiver = Array.isArray(data) ? (data[0] || null) : data;
        if (caregiver && caregiver.organizationId) {
          await router.push({ path: `/organization/${caregiver.organizationId}/caregiver/${userId}/senior-citizens` });
        } else {
          errorMessage.value = 'login.errors.caregiverNotFound';
        }
      } catch (err) {
        console.error('Error fetching caregiver:', err);
        errorMessage.value = 'login.errors.caregiverNotFound';
      }
      return;
    }


    await router.push('/');
  } catch (err) {
    console.error('[LoginForm] signIn error', err);
    errorMessage.value = 'login.errors.invalidCredentials';
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <form class="login-form" @submit.prevent="onSubmit">
    <div class="form-field">
      <input
        class="full-width"
        type="email"
        v-model="email"
        :placeholder="t('login.emailPlaceholder')"
        aria-label="email"
      />
    </div>

    <div class="form-field">
      <div style="position:relative;">
        <input
          class="full-width"
          :type="hidePassword ? 'password' : 'text'"
          v-model="password"
          :placeholder="t('login.passwordPlaceholder')"
          aria-label="password"
        />
        <button type="button" @click="togglePasswordVisibility" style="position:absolute;right:8px;top:8px;">{{ hidePassword ? '👁️‍🗨️' : '👁️' }}</button>
      </div>
    </div>

    <div v-if="errorMessage" class="error-message">
      {{ t(errorMessage) }}
    </div>

    <button class="login-button" type="submit" :disabled="isLoading">
      <span v-if="isLoading" class="spinner-icon">⏳</span>
      <span v-if="isLoading">{{ t('login.loggingIn') }}</span>
      <span v-else>{{ t('login.loginButton') }}</span>
    </button>
  </form>
</template>

<style scoped>
.login-form {
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
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 4px;
  font-size: 0.875rem;
  text-align: center;
  border: 1px solid #fcc;
}

.login-button {
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

.login-button:hover:not(:disabled) {
  background-color: #0a6a9a;
}

.login-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.spinner-icon {
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
