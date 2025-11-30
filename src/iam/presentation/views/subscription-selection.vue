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
    <div class="subscription-wrapper">
      <pv-button
        :label="t('subscriptionSelection.back')"
        icon="pi pi-arrow-left"
        class="back-button"
        text
        @click="navigateBack"
      />

      <h1 class="selection-title">{{ t('subscriptionSelection.title') }}</h1>
      <p class="selection-subtitle">{{ t('subscriptionSelection.subtitle') }}</p>

      <div class="subscription-plans">
        <!-- Freemium Plan -->
        <pv-card class="plan-card" :class="{ disabled: isPlanDisabled('fremium') }">
          <template #header>
            <div class="plan-header">
              <h2 class="plan-name">{{ t('subscriptionSelection.fremium') }}</h2>
            </div>
          </template>
          <template #content>
            <div class="plan-price">
              <span class="price-amount">{{ t('subscriptionSelection.free') }}</span>
              <span class="price-period">/{{ t('subscriptionSelection.month') }}</span>
            </div>
            <ul class="plan-features">
              <li class="feature-item">
                <i class="pi pi-check check-icon"></i>
                <span>{{ t('subscriptionSelection.features.vitalSigns') }}</span>
              </li>
              <li class="feature-item">
                <i class="pi pi-check check-icon"></i>
                <span>{{ t('subscriptionSelection.features.realTimeAlerts') }}</span>
              </li>
              <li class="feature-item">
                <i class="pi pi-check check-icon"></i>
                <span>{{ t('subscriptionSelection.features.webAccess') }}</span>
              </li>
            </ul>
            <pv-button
              :label="t('subscriptionSelection.selectPlan')"
              :disabled="isPlanDisabled('fremium')"
              @click="selectPlan('fremium')"
              class="w-full"
              outlined
            />
          </template>
        </pv-card>

        <!-- Premium Plan -->
        <pv-card class="plan-card premium" :class="{ disabled: isPlanDisabled('premium') }">
          <template #header>
            <div class="plan-header">
              <h2 class="plan-name">{{ t('subscriptionSelection.premium') }}</h2>
              <pv-tag :value="t('subscriptionSelection.recommended')" severity="warning" />
            </div>
          </template>
          <template #content>
            <div class="plan-price">
              <span class="price-amount">$20</span>
              <span class="price-period">/{{ t('subscriptionSelection.month') }}</span>
            </div>
            <ul class="plan-features">
              <li class="feature-item">
                <i class="pi pi-check check-icon"></i>
                <span>{{ t('subscriptionSelection.features.vitalSigns') }}</span>
              </li>
              <li class="feature-item">
                <i class="pi pi-check check-icon"></i>
                <span>{{ t('subscriptionSelection.features.realTimeAlerts') }}</span>
              </li>
              <li class="feature-item">
                <i class="pi pi-check check-icon"></i>
                <span>{{ t('subscriptionSelection.features.webAccess') }}</span>
              </li>
              <li class="feature-item">
                <i class="pi pi-check check-icon"></i>
                <span>{{ t('subscriptionSelection.features.downloadableReports') }}</span>
              </li>
              <li class="feature-item">
                <i class="pi pi-check check-icon"></i>
                <span>{{ t('subscriptionSelection.features.prioritySupport') }}</span>
              </li>
            </ul>
            <pv-button
              :label="t('subscriptionSelection.selectPlan')"
              :disabled="isPlanDisabled('premium')"
              @click="selectPlan('premium')"
              class="w-full"
            />
          </template>
        </pv-card>

        <!-- Enterprise Plan -->
        <pv-card class="plan-card" :class="{ disabled: isPlanDisabled('enterprise') }">
          <template #header>
            <div class="plan-header">
              <h2 class="plan-name">{{ t('subscriptionSelection.enterprise') }}</h2>
            </div>
          </template>
          <template #content>
            <div class="plan-price">
              <span class="price-amount">{{ t('subscriptionSelection.custom') }}</span>
            </div>
            <ul class="plan-features">
              <li class="feature-item">
                <i class="pi pi-check check-icon"></i>
                <span>{{ t('subscriptionSelection.features.vitalSigns') }}</span>
              </li>
              <li class="feature-item">
                <i class="pi pi-check check-icon"></i>
                <span>{{ t('subscriptionSelection.features.realTimeAlerts') }}</span>
              </li>
              <li class="feature-item">
                <i class="pi pi-check check-icon"></i>
                <span>{{ t('subscriptionSelection.features.webAccess') }}</span>
              </li>
              <li class="feature-item">
                <i class="pi pi-check check-icon"></i>
                <span>{{ t('subscriptionSelection.features.downloadableReports') }}</span>
              </li>
              <li class="feature-item">
                <i class="pi pi-check check-icon"></i>
                <span>{{ t('subscriptionSelection.features.prioritySupport') }}</span>
              </li>
              <li class="feature-item">
                <i class="pi pi-check check-icon"></i>
                <span>{{ t('subscriptionSelection.features.customReports') }}</span>
              </li>
            </ul>
            <pv-button
              :label="t('subscriptionSelection.contactUs')"
              :disabled="isPlanDisabled('enterprise')"
              @click="contactUs"
              class="w-full"
              severity="secondary"
            />
          </template>
        </pv-card>
      </div>

      <pv-message v-if="errorMessage" severity="error" :closable="false">
        {{ t(errorMessage) }}
      </pv-message>
    </div>
  </div>
</template>

<style scoped>
.subscription-container {
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

.subscription-wrapper {
    width: 100%;
    max-width: 1400px;
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

.subscription-plans {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 2rem;
    margin-bottom: 2rem;
}

.plan-card {
    transition: all 0.3s ease;
    border: 2px solid transparent;
}

.plan-card:not(.disabled):hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 24px rgba(102, 126, 234, 0.3);
    border-color: #667eea;
}

.plan-card.premium {
    border-color: #FF9800;
}

.plan-card.premium:not(.disabled):hover {
    border-color: #FF9800;
    box-shadow: 0 12px 24px rgba(255, 152, 0, 0.3);
}

.plan-card.disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.plan-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.plan-name {
    font-size: 1.75rem;
    font-weight: 700;
    color: white;
    margin: 0;
}

.plan-price {
    margin: 2rem 0;
    text-align: center;
}

.price-amount {
    font-size: 3rem;
    font-weight: 700;
    color: #333;
}

.price-period {
    font-size: 1.125rem;
    color: #666;
    margin-left: 4px;
}

.plan-features {
    list-style: none;
    padding: 0;
    margin: 0 0 2rem 0;
    flex-grow: 1;
}

.feature-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
    color: #333;
    font-size: 1rem;
}

.check-icon {
    color: #667eea;
    font-size: 1.25rem;
    font-weight: bold;
}

@media (max-width: 768px) {
    .subscription-wrapper {
        padding: 2rem 1.5rem;
    }

    .selection-title {
        font-size: 2rem;
    }

    .subscription-plans {
        grid-template-columns: 1fr;
    }
}
</style>