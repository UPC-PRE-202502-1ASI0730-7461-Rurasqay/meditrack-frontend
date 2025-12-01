<script setup>
import { useOrganizationStore } from "../../application/organization.store.js";
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { storeToRefs } from "pinia";
import { useRouter, useRoute } from "vue-router";
import { useConfirm } from "primevue/useconfirm";

const { t } = useI18n();
const store = useOrganizationStore();
const router = useRouter();
const route = useRoute();
const confirm = useConfirm();

const organizationId = computed(() => parseInt(route.params.organizationId));

const {
  caregiversByOrganization,
  caregiversLoaded,
  caregiversByOrganizationCount,
  errors
} = storeToRefs(store);

const {
  fetchCaregiversByOrganization,
  deleteCaregiver,
  getCaregiversById
} = store;

const showForm = ref(false);
const editingCaregiver = ref(null);

onMounted(async () => {
  console.log('CaregiverList mounted for organization:', organizationId.value);
  if (!caregiversLoaded.value && organizationId.value) {
    await fetchCaregiversByOrganization(organizationId.value);
    console.log('caregivers loaded', caregiversLoaded.value);
    console.log('caregiversByOrganization:', caregiversByOrganization.value);
  }
});

const haveCaregiverss = computed(() => {
  return caregiversByOrganizationCount.value > 0;
});

const openAddCaregiverForm = () => {
  editingCaregiver.value = null;
  router.push({ name: 'caregiver-new' });
};

const openEditCaregiverForm = (caregiver) => {
  router.push({ name: 'caregiver-edit', params: { id: caregiver.id } });
};

const navigateToDetails = (id) => {
  router.push({ name: 'caregiver-details', params: { id } });
};

const confirmDelete = (caregiver) => {
  confirm.require({
    message: t('caregiver.confirmDelete', { name: caregiver.fullName }),
    header: t('caregiver.deleteHeader'),
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      deleteCaregiver(caregiver);
    }
  });
};
</script>

<template>
  <div class="p-4">
    <h1>{{ t('caregiver.title') }}</h1>

    <!-- Estado vacío -->
    <div v-if="!haveCaregiverss" class="empty-state text-center p-6">
      <p class="text-xl mb-4">{{ t('caregiver.empty') }}</p>
      <pv-button
          :label="t('caregiver.add')"
          icon="pi pi-plus"
          class="p-button-primary"
          @click="openAddCaregiverForm"
      />
    </div>

    <!-- Lista de caregivers -->
    <div v-else>
      <pv-button
          :label="t('caregiver.add')"
          class="mb-3"
          icon="pi pi-plus"
          @click="openAddCaregiverForm"
      />
      
      <pv-data-table
          :loading="!caregiversLoaded"
          :value="caregiversByOrganization"
          paginator
          :rows="5"
          :rows-per-page-options="[5, 10, 20]"
          striped-rows
          table-style="min-width: 50rem"
      >
        <pv-column :header="t('caregiver.id')" field="id" sortable>
          <template #body="slotProps">
            <a
                href="#"
                class="text-blue-600 hover:underline"
                @click.prevent="navigateToDetails(slotProps.data.id)"
            >
              {{ slotProps.data.id }}
            </a>
          </template>
        </pv-column>
        
        <pv-column :header="t('caregiver.fullName')" field="fullName" sortable>
          <template #body="slotProps">
            <a
                href="#"
                class="text-blue-600 hover:underline"
                @click.prevent="navigateToDetails(slotProps.data.id)"
            >
              {{ slotProps.data.fullName }}
            </a>
          </template>
        </pv-column>
        
        <pv-column :header="t('caregiver.email')" field="email" sortable />
        
        <pv-column :header="t('caregiver.phoneNumber')" field="phoneNumber" sortable />
        
        <pv-column :header="t('caregiver.actions')">
          <template #body="slotProps">
            <pv-button
                icon="pi pi-pencil"
                rounded
                text
                @click="openEditCaregiverForm(slotProps.data)"
            />
            <pv-button
                icon="pi pi-trash"
                rounded
                severity="danger"
                text
                @click="confirmDelete(slotProps.data)"
            />
          </template>
        </pv-column>
      </pv-data-table>
    </div>

    <!-- Errores -->
    <div v-if="errors.length" class="text-red-500 mt-3">
      {{ t('errors.occurred') }}: {{ errors.map(e => e.message).join(', ') }}
    </div>

    <pv-confirm-dialog />
  </div>
</template>

<style scoped>
.empty-state {
  background: #f8f9fa;
  border-radius: 8px;
  margin: 2rem 0;
}
</style>
