<script setup>
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from "vue-i18n";

const router = useRouter();
const route = useRoute();
const { t } = useI18n();

function navigateBack() {
  router.push({ name: 'login' }).catch(() => router.push('/auth/login'));
}

function selectUserType(userType) {
  const role = userType === 'relative' ? 'relative' : 'admin';
  console.log('[UserTypeSelection] Selected user type:', userType, '-> role:', role);

  router.push({ name: 'register', query: { role } }).catch(() => {
    router.push({ path: '/auth/register', query: { role } }).catch(() => {});
  });
}
</script>

<template>
  <div class="user-type-container">
    <div class="selection-wrapper">
      <pv-button
        :label="t('userTypeSelection.back')"
        icon="pi pi-arrow-left"
        class="back-button"
        text
        @click="navigateBack"
      />

      <h1 class="selection-title">{{ t('userTypeSelection.title') }}</h1>
      <p class="selection-subtitle">{{ t('userTypeSelection.subtitle') }}</p>

      <div class="user-type-options">
        <pv-card class="user-type-option-card" @click="selectUserType('relative')">
          <template #content>
            <div class="card-content">
              <div class="icon-circle">
                <span class="icon-emoji">👥</span>
              </div>
              <h3 class="option-title">{{ t('userTypeSelection.relative') }}</h3>
              <p class="option-description">{{ t('userTypeSelection.relativeDescription') }}</p>
            </div>
          </template>
        </pv-card>

        <pv-card class="user-type-option-card" @click="selectUserType('nursing-home')">
          <template #content>
            <div class="card-content">
              <div class="icon-circle">
                <span class="icon-emoji">🏠</span>
              </div>
              <h3 class="option-title">{{ t('userTypeSelection.nursingHome') }}</h3>
              <p class="option-description">{{ t('userTypeSelection.nursingHomeDescription') }}</p>
            </div>
          </template>
        </pv-card>

        <pv-card class="user-type-option-card" @click="selectUserType('clinic')">
          <template #content>
            <div class="card-content">
              <div class="icon-circle">
                <span class="icon-emoji">🏥</span>
              </div>
              <h3 class="option-title">{{ t('userTypeSelection.clinic') }}</h3>
              <p class="option-description">{{ t('userTypeSelection.clinicDescription') }}</p>
            </div>
          </template>
        </pv-card>
      </div>
    </div>
  </div>
</template>


<style scoped>
.user-type-container {
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

.selection-wrapper {
    width: 100%;
    max-width: 1200px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    padding: 3rem;
}

.back-button {
    margin-bottom: 2rem;
}

.selection-title {
    font-size: 2.5rem;
    font-weight: 700;
    text-align: center;
    margin-bottom: 0.5rem;
    color: #333;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.selection-subtitle {
    font-size: 1.125rem;
    color: #666;
    text-align: center;
    margin-bottom: 3rem;
}

.user-type-options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
}

.user-type-option-card {
    cursor: pointer;
    transition: all 0.3s ease;
    border: 2px solid transparent;
}

.user-type-option-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 24px rgba(102, 126, 234, 0.3);
    border-color: #667eea;
}

.card-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 1rem;
}

.icon-circle {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.5rem;
    box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
}

.icon-emoji {
    font-size: 3rem;
}

.option-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #333;
}

.option-description {
    font-size: 1rem;
    color: #666;
    line-height: 1.6;
}

@media (max-width: 768px) {
    .selection-wrapper {
        padding: 2rem 1.5rem;
    }

    .selection-title {
        font-size: 2rem;
    }

    .user-type-options {
        grid-template-columns: 1fr;
    }
}
</style>