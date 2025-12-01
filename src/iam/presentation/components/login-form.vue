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
      await router.push({ path: `/relative/${userId}` });
      return;
    }

    if (role === 'admin') {
      try {
        const resp = await organizationApi.getAdminByUserId(String(userId));
        const data = resp && resp.data ? resp.data : resp;
        const admin = Array.isArray(data) ? (data[0] || null) : data;
        if (admin && admin.organizationId) {
          await router.push({ path: `/organization/${admin.organizationId}/admin/${userId}/senior-citizens` });
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
      <pv-float-label>
        <pv-input-text
          id="email"
          v-model="email"
          type="email"
          class="w-full"
          :invalid="errorMessage !== null"
        />
        <label for="email">{{ t('login.emailPlaceholder') }}</label>
      </pv-float-label>
    </div>

    <div class="form-field">
      <pv-float-label>
        <pv-password
          id="password"
          v-model="password"
          :feedback="false"
          toggleMask
          class="w-full"
          :invalid="errorMessage !== null"
        />
        <label for="password">{{ t('login.passwordPlaceholder') }}</label>
      </pv-float-label>
    </div>

    <pv-message v-if="errorMessage" severity="error" :closable="false">
      {{ t(errorMessage) }}
    </pv-message>

    <pv-button
      type="submit"
      :label="isLoading ? t('login.loggingIn') : t('login.loginButton')"
      :loading="isLoading"
      class="w-full mt-3"
      size="large"
    />
  </form>
</template>

<style scoped>
.login-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-field {
  width: 100%;
}
</style>
