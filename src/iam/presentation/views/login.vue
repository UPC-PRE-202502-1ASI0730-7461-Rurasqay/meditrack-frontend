<script setup>
import { useRouter } from 'vue-router';
 import logo from '../../../assets/logo1.png'
import LoginForm from "../components/login-form.vue";
import {useI18n} from "vue-i18n";

const router = useRouter();

const { t } = useI18n()

function navigateToSignUp(event) {
  if (event && event.preventDefault) event.preventDefault();
  router.push({ name: 'user-type-selection' }).catch(() => {
    router.push('/auth/user-type-selection');
  });
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <h1 class="welcome-title">{{ t('login.welcome') }}</h1>

      <div class="logo-container">
        <img :src="logo" alt="MediTrack Logo" class="logo" />
      </div>


      <LoginForm />

      <div class="signup-container">
        <span class="signup-text">{{ t('login.noAccount') }}</span>
          <a href="#" class="signup-link" @click="navigateToSignUp">{{ t('login.signUp') }}</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100%;
    padding: 20px;
}

.login-card {
    background-color: white;
    border-radius: 8px;
    padding: 40px;
    width: 100%;
    max-width: 450px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
}

.welcome-title {
    font-size: 1.75rem;
    font-weight: 500;
    color: #333;
    margin-bottom: 30px;
    text-align: center;
}

.logo-container {
    margin-bottom: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.logo {
    height: 80px;
    width: auto;
}

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

.forgot-password-container {
    display: flex;
    justify-content: flex-end;
    margin-top: -10px;
    margin-bottom: 10px;
}

.forgot-password-link {
    color: #0C7BB5;
    text-decoration: none;
    font-size: 0.875rem;
    cursor: pointer;
    transition: color 0.2s;
}

.forgot-password-link:hover {
    color: #0a6a9a;
    text-decoration: underline;
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
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

.signup-container {
    margin-top: 30px;
    text-align: center;
    font-size: 0.875rem;
    color: #666;
}

.signup-text {
    margin-right: 5px;
}

.signup-link {
    color: #0C7BB5;
    text-decoration: none;
    font-weight: 500;
    cursor: pointer;
    transition: color 0.2s;
}

.signup-link:hover {
    color: #0a6a9a;
    text-decoration: underline;
}
</style>