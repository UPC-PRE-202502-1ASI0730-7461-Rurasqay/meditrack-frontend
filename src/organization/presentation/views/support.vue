<script setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "primevue/usetoast";

const { t } = useI18n();
const toast = useToast();

const supportForm = ref({
  fullName: '',
  email: '',
  phone: '',
  problemType: '',
  description: ''
});

const problemTypes = [
  { label: t('support.technical'), value: 'technical' },
  { label: t('support.billing'), value: 'billing' },
  { label: t('support.account'), value: 'account' },
  { label: t('support.medication'), value: 'medication' },
  { label: t('support.general'), value: 'general' }
];

const submitted = ref(false);

const onSubmit = () => {
  submitted.value = true;
  
  // Validate all fields are filled
  if (!supportForm.value.fullName || 
      !supportForm.value.email || 
      !supportForm.value.problemType || 
      !supportForm.value.description) {
    toast.add({
      severity: 'error',
      summary: t('support.error'),
      detail: t('support.fillAllFields'),
      life: 3000
    });
    return;
  }

  // Static simulation - doesn't send real data
  console.log('Support form submitted:', supportForm.value);
  
  toast.add({
    severity: 'success',
    summary: t('support.success'),
    detail: t('support.submissionSuccess'),
    life: 5000
  });

  // Reset form
  supportForm.value = {
    fullName: '',
    email: '',
    phone: '',
    problemType: '',
    description: ''
  };
  
  submitted.value = false;
};
</script>

<template>
  <div class="p-4">
    <div class="support-container" style="max-width: 800px; margin: 0 auto;">
      <div class="support-header mb-4">
        <h1 class="text-4xl font-bold mb-2">{{ t('support.title') }}</h1>
        <p class="text-lg text-gray-600">{{ t('support.description') }}</p>
      </div>

      <pv-card>
        <template #content>
          <form @submit.prevent="onSubmit" class="support-form">
            <div class="grid">
              <!-- Full Name -->
              <div class="col-12">
                <div class="field">
                  <label for="fullName" class="block mb-2 font-semibold">
                    {{ t('support.fullName') }} <span class="text-red-500">*</span>
                  </label>
                  <pv-input-text
                      id="fullName"
                      v-model="supportForm.fullName"
                      :class="{ 'p-invalid': submitted && !supportForm.fullName }"
                      class="w-full"
                  />
                  <small v-if="submitted && !supportForm.fullName" class="p-error">
                    {{ t('support.errors.fullNameRequired') }}
                  </small>
                </div>
              </div>

              <!-- Email -->
              <div class="col-12">
                <div class="field">
                  <label for="email" class="block mb-2 font-semibold">
                    {{ t('support.email') }} <span class="text-red-500">*</span>
                  </label>
                  <pv-input-text
                      id="email"
                      v-model="supportForm.email"
                      type="email"
                      :class="{ 'p-invalid': submitted && !supportForm.email }"
                      class="w-full"
                  />
                  <small v-if="submitted && !supportForm.email" class="p-error">
                    {{ t('support.errors.emailRequired') }}
                  </small>
                </div>
              </div>

              <!-- Phone -->
              <div class="col-12">
                <div class="field">
                  <label for="phone" class="block mb-2 font-semibold">
                    {{ t('support.phone') }}
                  </label>
                  <pv-input-text
                      id="phone"
                      v-model="supportForm.phone"
                      type="tel"
                      class="w-full"
                  />
                </div>
              </div>

              <!-- Problem Type -->
              <div class="col-12">
                <div class="field">
                  <label for="problemType" class="block mb-2 font-semibold">
                    {{ t('support.problemType') }} <span class="text-red-500">*</span>
                  </label>
                  <pv-select
                      id="problemType"
                      v-model="supportForm.problemType"
                      :options="problemTypes"
                      option-label="label"
                      option-value="value"
                      :placeholder="t('support.selectCategory')"
                      :class="{ 'p-invalid': submitted && !supportForm.problemType }"
                      class="w-full"
                  />
                  <small v-if="submitted && !supportForm.problemType" class="p-error">
                    {{ t('support.errors.problemTypeRequired') }}
                  </small>
                </div>
              </div>

              <!-- Description -->
              <div class="col-12">
                <div class="field">
                  <label for="description" class="block mb-2 font-semibold">
                    {{ t('support.problemDescription') }} <span class="text-red-500">*</span>
                  </label>
                  <pv-textarea
                      id="description"
                      v-model="supportForm.description"
                      rows="6"
                      :placeholder="t('support.describeProblem')"
                      :class="{ 'p-invalid': submitted && !supportForm.description }"
                      class="w-full"
                  />
                  <small v-if="submitted && !supportForm.description" class="p-error">
                    {{ t('support.errors.descriptionRequired') }}
                  </small>
                </div>
              </div>
            </div>

            <!-- Submit Button -->
            <div class="flex justify-content-center mt-4">
              <pv-button
                  type="submit"
                  :label="t('support.submitClaim')"
                  icon="pi pi-send"
                  class="p-button-lg p-button-primary"
              />
            </div>
          </form>
        </template>
      </pv-card>

      <!-- Additional Information -->
      <pv-card class="mt-4">
        <template #title>
          <h3>{{ t('support.additionalInfo') }}</h3>
        </template>
        <template #content>
          <div class="grid">
            <div class="col-12 md:col-4 text-center">
              <i class="pi pi-phone text-4xl text-blue-500 mb-2"></i>
              <p class="font-bold">{{ t('support.phoneSupport') }}</p>
              <p class="text-gray-600">+51 999 999 999</p>
            </div>
            <div class="col-12 md:col-4 text-center">
              <i class="pi pi-envelope text-4xl text-blue-500 mb-2"></i>
              <p class="font-bold">{{ t('support.emailSupport') }}</p>
              <p class="text-gray-600">support@meditrack.com</p>
            </div>
            <div class="col-12 md:col-4 text-center">
              <i class="pi pi-clock text-4xl text-blue-500 mb-2"></i>
              <p class="font-bold">{{ t('support.scheduleSupport') }}</p>
              <p class="text-gray-600">{{ t('support.schedule') }}</p>
            </div>
          </div>
        </template>
      </pv-card>
    </div>

    <pv-toast />
  </div>
</template>

<style scoped>
.support-container {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
