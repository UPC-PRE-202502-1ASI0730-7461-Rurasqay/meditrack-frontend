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
    <div class="login-content">
      <div class="login-left">
        <div class="brand-section">
          <img :src="logo" alt="MediTrack Logo" class="logo" />
          <h1 class="brand-title">MediTrack</h1>
          <p class="brand-subtitle">{{ t('login.subtitle') }}</p>
        </div>
      </div>
      
      <div class="login-right">
        <pv-card class="login-card">
          <template #title>
            <h2 class="welcome-title">{{ t('login.welcome') }}</h2>
          </template>
          <template #content>
            <LoginForm />
            
            <div class="signup-container">
              <span class="signup-text">{{ t('login.noAccount') }}</span>
              <pv-button 
                :label="t('login.signUp')" 
                link 
                @click="navigateToSignUp"
                class="signup-link"
              />
            </div>
          </template>
        </pv-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    width: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    width: 100%;
    max-width: 1400px;
    min-height: 600px;
    margin: 2rem;
    background: white;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login-left {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 4rem;
    color: white;
}

.brand-section {
    text-align: center;
}

.logo {
    height: 120px;
    width: auto;
    margin-bottom: 2rem;
    filter: brightness(0) invert(1);
}

.brand-title {
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 1rem;
}

.brand-subtitle {
    font-size: 1.25rem;
    opacity: 0.9;
}

.login-right {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 4rem;
}

.login-card {
    width: 100%;
    max-width: 500px;
    box-shadow: none;
}

.welcome-title {
    font-size: 2rem;
    font-weight: 600;
    color: #333;
    text-align: center;
    margin-bottom: 0;
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
    margin-top: 2rem;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
}

.signup-text {
    color: #666;
    font-size: 0.95rem;
}

.signup-link {
    font-weight: 600;
}

@media (max-width: 968px) {
    .login-content {
        grid-template-columns: 1fr;
    }
    
    .login-left {
        display: none;
    }
    
    .login-right {
        padding: 2rem;
    }
}
</style>