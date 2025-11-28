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
    <div class="user-type-card">
      <button class="back-button" @click="navigateBack" aria-label="$t('userTypeSelection.back')">←</button>

      <h1 class="selection-title">{{ t('userTypeSelection.title') }}</h1>

      <div class="user-type-options">
        <div class="user-type-card-option"
             role="button"
             tabindex="0"
             @click="selectUserType('relative')"
             @keydown.enter="selectUserType('relative')"
             @keydown.space.prevent="selectUserType('relative')">
          <div class="option-icon">
            <span class="option-icon-large">👥</span>
          </div>
          <span class="option-label">{{ t('userTypeSelection.relative') }}</span>
        </div>

        <div class="user-type-card-option"
             role="button"
             tabindex="0"
             @click="selectUserType('nursing-home')"
             @keydown.enter="selectUserType('nursing-home')"
             @keydown.space.prevent="selectUserType('nursing-home')">
          <div class="option-icon">
            <span class="option-icon-large">🏠</span>
          </div>
          <span class="option-label">{{ t('userTypeSelection.nursingHome') }}</span>
        </div>

        <div class="user-type-card-option"
             role="button"
             tabindex="0"
             @click="selectUserType('clinic')"
             @keydown.enter="selectUserType('clinic')"
             @keydown.space.prevent="selectUserType('clinic')">
          <div class="option-icon">
            <span class="option-icon-large">🏥</span>
          </div>
          <span class="option-label">{{ t('userTypeSelection.clinic') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>
.user-type-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100%;
    padding: 20px;
}

.user-type-card {
    background-color: white;
    border-radius: 8px;
    padding: 40px;
    width: 100%;
    max-width: 800px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    position: relative;
}

.back-button {
    position: absolute;
    top: 16px;
    left: 16px;
    color: #333;
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
}

.selection-title {
    font-size: 1.75rem;
    font-weight: 500;
    color: #333;
    margin-bottom: 40px;
    text-align: center;
    margin-top: 20px;
}

.user-type-options {
    display: flex;
    justify-content: space-between;
    gap: 24px;
    flex-wrap: wrap;
}

.user-type-card-option {
    flex: 1;
    min-width: 200px;
    background-color: #f5f5f5;
    border-radius: 8px;
    padding: 32px 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border: 2px solid transparent;
}

.user-type-card-option:hover {
    background-color: #e8f4f8;
    border-color: #0C7BB5;
    transform: translateY(-4px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.user-type-card-option:active {
    transform: translateY(-2px);
}

.user-type-card-option:focus {
    outline: 2px solid #0C7BB5;
    outline-offset: 2px;
}

.option-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 80px;
    height: 80px;
    background-color: white;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.option-icon-large {
    font-size: 48px;
    width: 48px;
    height: 48px;
    color: #0C7BB5;
}

.option-label {
    font-size: 1.1rem;
    font-weight: 500;
    color: #333;
    text-align: center;
}

@media (max-width: 768px) {
    .user-type-options {
        flex-direction: column;
    }

    .user-type-card-option {
        min-width: 100%;
    }
}
</style>