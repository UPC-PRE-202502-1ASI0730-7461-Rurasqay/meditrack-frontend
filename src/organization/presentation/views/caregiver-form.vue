<script setup>
import { useOrganizationStore } from "../../application/organization.store.js";
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { CaregiverAssembler } from "../../domain/model/caregiver.assembler.js";

const { t } = useI18n();
const store = useOrganizationStore();
const router = useRouter();
const route = useRoute();

const {
  organization,
  addCaregiver,
  updateCaregiver,
  getCaregiversById
} = store;

const isEditMode = computed(() => !!route.params.id);
const caregiverId = computed(() => route.params.id ? parseInt(route.params.id) : null);

// Form data
const form = ref({
  firstName: '',
  lastName: '',
  age: null,
  email: '',
  phoneNumber: '',
  imageUrl: '',
  organizationId: null
});

const institutionEmailDomain = computed(() => {
  // This would come from the organization/store in a real implementation
  return organization.value ? `@${organization.value.name.toLowerCase().replace(/\s+/g, '')}.com` : '';
});

const errors = ref({});

onMounted(() => {
  // Set organization ID
  if (organization.value) {
    form.value.organizationId = organization.value.id;
  }

  // Load caregiver data if editing
  if (isEditMode.value && caregiverId.value) {
    const caregiver = getCaregiversById(caregiverId.value);
    if (caregiver && caregiver.length > 0) {
      const caregiverData = caregiver[0];
      form.value = {
        firstName: caregiverData.firstName || '',
        lastName: caregiverData.lastName || '',
        age: caregiverData.age || null,
        email: caregiverData.email || '',
        phoneNumber: caregiverData.phoneNumber || '',
        imageUrl: caregiverData.imageUrl || '',
        organizationId: caregiverData.organizationId
      };
    }
  }
});

// Auto-generate institutional email
watch([() => form.value.firstName, () => form.value.lastName], () => {
  if (!isEditMode.value && form.value.firstName && form.value.lastName && institutionEmailDomain.value) {
    const firstName = form.value.firstName.toLowerCase().trim();
    const lastName = form.value.lastName.toLowerCase().trim();
    const normalizedFirstName = firstName.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const normalizedLastName = lastName.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    // Only update if email is empty or matches previous auto-generated pattern
    if (!form.value.email || form.value.email.endsWith(institutionEmailDomain.value)) {
      form.value.email = `${normalizedFirstName}.${normalizedLastName}${institutionEmailDomain.value}`;
    }
  }
});

const validate = () => {
  errors.value = {};
  
  if (!form.value.firstName) {
    errors.value.firstName = t('caregiver.errors.firstNameRequired');
  }
  
  if (!form.value.lastName) {
    errors.value.lastName = t('caregiver.errors.lastNameRequired');
  }
  
  if (!form.value.age || form.value.age < 18) {
    errors.value.age = t('caregiver.errors.ageRequired');
  }
  
  if (!form.value.email) {
    errors.value.email = t('caregiver.errors.emailRequired');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    errors.value.email = t('caregiver.errors.emailInvalid');
  }
  
  if (!form.value.phoneNumber) {
    errors.value.phoneNumber = t('caregiver.errors.phoneRequired');
  }
  
  if (!form.value.imageUrl) {
    errors.value.imageUrl = t('caregiver.errors.imageUrlRequired');
  } else if (!/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(form.value.imageUrl)) {
    errors.value.imageUrl = t('caregiver.errors.imageUrlInvalid');
  }
  
  return Object.keys(errors.value).length === 0;
};

const onSubmit = () => {
  if (!validate()) {
    return;
  }

  const caregiverData = {
    firstName: form.value.firstName,
    lastName: form.value.lastName,
    age: parseInt(form.value.age),
    email: form.value.email.trim(),
    phoneNumber: form.value.phoneNumber,
    imageUrl: form.value.imageUrl || 'https://via.placeholder.com/150x150/CCCCCC/FFFFFF?text=Caregiver',
    organizationId: form.value.organizationId
  };

  if (isEditMode.value && caregiverId.value) {
    caregiverData.id = caregiverId.value;
    updateCaregiver(caregiverData);
  } else {
    addCaregiver(caregiverData);
  }

  router.push({ name: 'caregiver-list' });
};

const onCancel = () => {
  router.push({ name: 'caregiver-list' });
};
</script>

<template>
  <div class="p-4">
    <h1>{{ isEditMode ? t('caregiver.editTitle') : t('caregiver.newTitle') }}</h1>

    <div class="form-container mt-4">
      <form @submit.prevent="onSubmit" class="caregiver-form">
        <div class="grid">
          <!-- First Name -->
          <div class="col-12 md:col-6">
            <div class="field">
              <label for="firstName" class="block mb-2">{{ t('caregiver.firstName') }}:</label>
              <pv-input-text
                  id="firstName"
                  v-model="form.firstName"
                  :class="{ 'p-invalid': errors.firstName }"
                  class="w-full"
              />
              <small v-if="errors.firstName" class="p-error">{{ errors.firstName }}</small>
            </div>
          </div>

          <!-- Last Name -->
          <div class="col-12 md:col-6">
            <div class="field">
              <label for="lastName" class="block mb-2">{{ t('caregiver.lastName') }}:</label>
              <pv-input-text
                  id="lastName"
                  v-model="form.lastName"
                  :class="{ 'p-invalid': errors.lastName }"
                  class="w-full"
              />
              <small v-if="errors.lastName" class="p-error">{{ errors.lastName }}</small>
            </div>
          </div>

          <!-- Age -->
          <div class="col-12 md:col-6">
            <div class="field">
              <label for="age" class="block mb-2">{{ t('caregiver.age') }}:</label>
              <pv-input-number
                  id="age"
                  v-model="form.age"
                  :min="18"
                  :class="{ 'p-invalid': errors.age }"
                  class="w-full"
              />
              <small v-if="errors.age" class="p-error">{{ errors.age }}</small>
            </div>
          </div>

          <!-- Email -->
          <div class="col-12 md:col-6">
            <div class="field">
              <label for="email" class="block mb-2">{{ t('caregiver.email') }}:</label>
              <pv-input-text
                  id="email"
                  v-model="form.email"
                  type="email"
                  :placeholder="institutionEmailDomain ? t('caregiver.emailPlaceholder') + institutionEmailDomain : t('caregiver.emailPlaceholderExample')"
                  :class="{ 'p-invalid': errors.email }"
                  class="w-full"
              />
              <small v-if="institutionEmailDomain && !isEditMode" class="block mt-1 text-sm text-gray-600">
                {{ t('caregiver.emailHint') }} {{ institutionEmailDomain }}
              </small>
              <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
            </div>
          </div>

          <!-- Phone Number -->
          <div class="col-12 md:col-6">
            <div class="field">
              <label for="phoneNumber" class="block mb-2">{{ t('caregiver.phoneNumber') }}:</label>
              <pv-input-text
                  id="phoneNumber"
                  v-model="form.phoneNumber"
                  :class="{ 'p-invalid': errors.phoneNumber }"
                  class="w-full"
              />
              <small v-if="errors.phoneNumber" class="p-error">{{ errors.phoneNumber }}</small>
            </div>
          </div>

          <!-- Image URL -->
          <div class="col-12 md:col-6">
            <div class="field">
              <label for="imageUrl" class="block mb-2">
                {{ t('caregiver.imageUrl') }} ({{ t('caregiver.imageUrlHint') }}):
              </label>
              <pv-input-text
                  id="imageUrl"
                  v-model="form.imageUrl"
                  type="url"
                  :placeholder="t('caregiver.imageUrlPlaceholder')"
                  :class="{ 'p-invalid': errors.imageUrl }"
                  class="w-full"
              />
              <small v-if="errors.imageUrl" class="p-error">{{ errors.imageUrl }}</small>
            </div>
          </div>

          <!-- Image Preview -->
          <div v-if="form.imageUrl && !errors.imageUrl" class="col-12">
            <div class="field">
              <label class="block mb-2">{{ t('caregiver.preview') }}:</label>
              <img
                  :src="form.imageUrl"
                  :alt="t('caregiver.photo')"
                  class="preview-image"
                  style="max-width: 200px; max-height: 200px; border-radius: 8px;"
                  @error="$event.target.src='/assets/default-caregiver.png'"
              />
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex gap-2 mt-4">
          <pv-button
              type="submit"
              :label="t('caregiver.save')"
              icon="pi pi-check"
              class="p-button-success"
          />
          <pv-button
              type="button"
              :label="t('caregiver.cancel')"
              icon="pi pi-times"
              class="p-button-secondary"
              @click="onCancel"
          />
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.form-container {
  max-width: 1200px;
}

.preview-image {
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
