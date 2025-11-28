<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useRegistrationFlowStore } from '../../application/registration-flow.store.js';
import { useIAMStore } from '../../application/iam.store.js';
import {useI18n} from "vue-i18n";

const router = useRouter();
const route = useRoute();
const registrationFlow = useRegistrationFlowStore();
const iamStore = useIAMStore();

const userRole = ref('');
const isRelative = ref(false);
const isAdmin = ref(false);
const isLoading = ref(false);
const errorMessage = ref(null);

const { t } = useI18n();

function getCurrentRole() {
  // Priority 1: query params
  const qp = route.query?.role;
  if (qp) return String(qp).toLowerCase().trim();

  // Priority 2: auth store
  const currentUserRef = iamStore.currentUser;
  const currentUser = currentUserRef && (currentUserRef.value ?? currentUserRef);
  if (currentUser && currentUser.role) return String(currentUser.role).toLowerCase().trim();

  // Priority 3: registration flow store
  if (registrationFlow.role) return String(registrationFlow.role).toLowerCase().trim();

  // fallback
  return userRole.value ? String(userRole.value).toLowerCase().trim() : '';
}

function updateRoleFlags() {
  const role = getCurrentRole();
  userRole.value = role;
  isRelative.value = role === 'relative';
  isAdmin.value = role === 'admin';
}

onMounted(() => {
  try {
    // initialize
    updateRoleFlags();
  } catch (err) {
    console.error('[SubscriptionSelection] init error', err);
  }
});

function isPlanDisabled(planType) {
  const normalizedRole = getCurrentRole();
  const relative = normalizedRole === 'relative';
  const admin = normalizedRole === 'admin';

  // update refs for UI
  userRole.value = normalizedRole;
  isRelative.value = relative;
  isAdmin.value = admin;

  if (relative) return planType === 'enterprise';
  if (admin) return planType === 'fremium' || planType === 'premium';
  return false;
}

async function selectPlan(planType) {
  if (isPlanDisabled(planType)) return;

  updateRoleFlags();
  console.log('[SubscriptionSelection] selectPlan', planType, 'role', userRole.value);

  if (isRelative.value && planType === 'premium') {
    // go to billing
    router.push({ name: 'billing-information' }).catch(() => router.push('/auth/billing-information'));
    return;
  }

  if (isRelative.value && planType === 'fremium') {
    // create user immediately
    await createUserForRelative('fremium');
    return;
  }

  // enterprise or fallback
  if (isAdmin.value && planType === 'enterprise') {
    contactUs();
    return;
  }

  router.push('/');
}

async function createUserForRelative(plan = 'fremium') {
  isLoading.value = true;
  errorMessage.value = null;
  try {
    // Ensure registration flow has email/password
    const email = registrationFlow.email;
    const password = registrationFlow.password;
    const role = registrationFlow.role;
    if (!email || !password || !role) {
      console.error('[SubscriptionSelection] Missing registration flow data for relative user');
      router.push('/auth/login');
      return;
    }

    // set plan in flow
    registrationFlow.setPlanType(plan);

    // Use IAM store to sign up (it will read from registrationFlow if no command provided)
    await iamStore.signUp();

    // Keep planType and redirect to senior citizen registration
    router.push({ name: 'senior-citizen-registration' }).catch(() => router.push('/auth/senior-citizen-registration'));
  } catch (err) {
    console.error('[SubscriptionSelection] Error creating user for relative', err);
    errorMessage.value = 'subscriptionSelection.errors.createUserFailed';
  } finally {
    isLoading.value = false;
  }
}

function contactUs() {
  if (isAdmin.value) {
    // navigate to institution details for further enterprise flow
    router.push({ name: 'institution-details' }).catch(() => router.push('/auth/institution-details'));
  } else {
    console.warn('[SubscriptionSelection] contactUs clicked but user is not admin');
  }
}

function navigateBack() {
  router.push({ name: 'signup' }).catch(() => router.push('/auth/signup'));
}
</script>

<template>
  <div class="subscription-container">
    <div class="subscription-card">
      <button class="back-button" @click="navigateBack" aria-label="back">←</button>

      <h1 class="selection-title">{{ t('subscriptionSelection.title') }}</h1>

      <div class="subscription-plans">
        <!-- Fremium Plan -->
        <div class="plan-card">
          <div class="plan-header">
            <h2 class="plan-name">{{ t('subscriptionSelection.fremium') }}</h2>
          </div>
          <div class="plan-price">
            <span class="price-amount">{{ t('subscriptionSelection.free') }}</span>
            <span class="price-period">/{{ t('subscriptionSelection.month') }}</span>
          </div>
          <ul class="plan-features">
            <li class="feature-item"><span class="check-icon">✓</span><span>{{ t('subscriptionSelection.features.vitalSigns') }}</span></li>
            <li class="feature-item"><span class="check-icon">✓</span><span>{{ t('subscriptionSelection.features.realTimeAlerts') }}</span></li>
            <li class="feature-item"><span class="check-icon">✓</span><span>{{ t('subscriptionSelection.features.webAccess') }}</span></li>
          </ul>
          <button class="select-plan-button" :disabled="isPlanDisabled('fremium')" @click="selectPlan('fremium')">{{ t('subscriptionSelection.selectPlan') }}</button>
        </div>

        <!-- Premium Plan -->
        <div class="plan-card recommended">
          <div class="plan-header">
            <h2 class="plan-name">{{t('subscriptionSelection.premium') }}</h2>
            <span class="recommended-badge">{{ t('subscriptionSelection.recommended') }}</span>
          </div>
          <div class="plan-price">
            <span class="price-amount">$20</span>
            <span class="price-period">/{{ t('subscriptionSelection.month') }}</span>
          </div>
          <ul class="plan-features">
            <li class="feature-item"><span class="check-icon">✓</span><span>{{ t('subscriptionSelection.features.vitalSigns') }}</span></li>
            <li class="feature-item"><span class="check-icon">✓</span><span>{{ t('subscriptionSelection.features.realTimeAlerts') }}</span></li>
            <li class="feature-item"><span class="check-icon">✓</span><span>{{ t('subscriptionSelection.features.webAccess') }}</span></li>
            <li class="feature-item"><span class="check-icon">✓</span><span>{{ t('subscriptionSelection.features.downloadableReports') }}</span></li>
            <li class="feature-item"><span class="check-icon">✓</span><span>{{ t('subscriptionSelection.features.prioritySupport') }}</span></li>
          </ul>
          <button class="select-plan-button" :disabled="isPlanDisabled('premium')" @click="selectPlan('premium')">{{ $t('subscriptionSelection.selectPlan') }}</button>
        </div>

        <!-- Enterprise Plan -->
        <div class="plan-card">
          <div class="plan-header">
            <h2 class="plan-name">{{ t('subscriptionSelection.enterprise') }}</h2>
          </div>
          <div class="plan-price">
            <span class="price-amount">{{ t('subscriptionSelection.custom') }}</span>
          </div>
          <ul class="plan-features">
            <li class="feature-item"><span class="check-icon">✓</span><span>{{ t('subscriptionSelection.features.vitalSigns') }}</span></li>
            <li class="feature-item"><span class="check-icon">✓</span><span>{{ t('subscriptionSelection.features.realTimeAlerts') }}</span></li>
            <li class="feature-item"><span class="check-icon">✓</span><span>{{ t('subscriptionSelection.features.webAccess') }}</span></li>
            <li class="feature-item"><span class="check-icon">✓</span><span>{{ t('subscriptionSelection.features.customReports') }}</span></li>
            <li class="feature-item"><span class="check-icon">✓</span><span>{{ t('subscriptionSelection.features.prioritySupport') }}</span></li>
            <li class="feature-item"><span class="check-icon">✓</span><span>{{ t('subscriptionSelection.features.downloadableReports') }}</span></li>
          </ul>
          <button class="select-plan-button" :disabled="isPlanDisabled('enterprise')" @click="contactUs">{{ t('subscriptionSelection.contactUs') }}</button>
        </div>
      </div>

      <div v-if="errorMessage" class="error-message">{{ t(errorMessage) }}</div>
    </div>
  </div>
</template>

<style scoped>
.subscription-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100%;
    padding: 20px;
}

.subscription-card {
    background-color: white;
    border-radius: 8px;
    padding: 40px;
    width: 100%;
    max-width: 1200px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    position: relative;
}

.back-button {
    position: absolute;
    top: 16px;
    left: 16px;
    color: #333;
}

.selection-title {
    font-size: 1.75rem;
    font-weight: 500;
    color: #333;
    margin-bottom: 40px;
    text-align: center;
    margin-top: 20px;
}

.subscription-plans {
    display: flex;
    justify-content: space-between;
    gap: 24px;
    flex-wrap: wrap;
}

.plan-card {
    flex: 1;
    min-width: 280px;
    background-color: white;
    border-radius: 8px;
    padding: 32px 24px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border: 2px solid transparent;
    transition: all 0.3s ease;
}

.plan-card:hover {
    border-color: #0C7BB5;
    transform: translateY(-4px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.plan-card.recommended {
    border-color: #FF9800;
    position: relative;
}

.plan-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.plan-name {
    font-size: 1.5rem;
    font-weight: 600;
    color: #333;
    margin: 0;
}

.recommended-badge {
    background-color: #FF9800;
    color: white;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 500;
}

.plan-price {
    margin-bottom: 24px;
    text-align: center;
}

.price-amount {
    font-size: 2rem;
    font-weight: 700;
    color: #333;
}

.price-period {
    font-size: 1rem;
    color: #666;
    margin-left: 4px;
}

.plan-features {
    list-style: none;
    padding: 0;
    margin: 0 0 32px 0;
    flex-grow: 1;
}

.feature-item {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
    color: #333;
}

.check-icon {
    color: #0C7BB5;
    font-size: 20px;
    width: 20px;
    height: 20px;
}

.select-plan-button {
    width: 100%;
    background-color: #0C7BB5;
    color: white;
    padding: 12px 24px;
    font-size: 1rem;
    font-weight: 500;
    border-radius: 4px;
    transition: background-color 0.3s ease;
}

.select-plan-button:hover:not(:disabled) {
    background-color: #0a6a9a;
}

.select-plan-button:disabled {
    background-color: #cccccc;
    color: #666666;
    cursor: not-allowed;
    opacity: 0.6;
}

@media (max-width: 768px) {
    .subscription-plans {
        flex-direction: column;
    }

    .plan-card {
        min-width: 100%;
    }
}
</style>