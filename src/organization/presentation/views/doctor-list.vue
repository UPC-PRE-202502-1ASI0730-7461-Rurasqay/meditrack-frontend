<script setup>
import {useOrganizationStore} from "../../application/organization.store.js";
import {onMounted} from "vue";
import useIAMStore from "../../../identity-access-managment/application/iam.store.js";
import {Column as PvColumn, DataTable as PvDataTable} from "primevue";
import {useI18n} from "vue-i18n";
import {storeToRefs} from "pinia";
import {RouterLink, useRouter} from "vue-router";

const {t} = useI18n();
const store = useOrganizationStore();
const iamStore = useIAMStore();
const router = useRouter();

const {currentUser, currentUserLoaded} = storeToRefs(iamStore);
const {
  organization,
  organizationsLoaded,
  caregiversLoaded,
  doctorsLoaded,
  caregiversByOrganization,
  doctorsByOrganization,
  caregiversByOrganizationCount,
  doctorsByOrganizationCount
} = storeToRefs(store);

const {
  fetchOrganizationById,
  fetchCaregivers,
  fetchDoctors
} = store;


onMounted(async () => {
  console.log('DoctorList mounted');
  console.log('currentUser:', currentUser.value);

  if (!currentUser.value) {
    console.warn('No current user found.');
    return;
  }

  console.log('currentUser.entityId:', currentUser.value.entityId);

  if (!organizationsLoaded.value) {
    await fetchOrganizationById(currentUser.value.entityId);
    console.log('fetching organization by id', currentUser.value.entityId);
    console.log('organization loaded', organizationsLoaded.value);
    console.log('organization:', organization.value);
  }

  if (!organization.value) {
    console.warn('No organization found for the current user.');
    return;
  }

  console.log('organization.type:', organization.value.type);

  switch (organization.value.type) {
    case 'clinic':
      if (!doctorsLoaded.value) {
        await fetchDoctors();
        console.log('doctors loaded', doctorsLoaded.value);
        console.log('doctorsByOrganization:', doctorsByOrganization.value);
        console.log('doctorsByOrganizationCount:', doctorsByOrganizationCount.value);
      }
      break;
    case 'residence':
      if (!caregiversLoaded.value) {
        await fetchCaregivers();
        console.log('caregivers loaded', caregiversLoaded.value);
      }
      break;
    default:
      console.warn('Unknown organization type:', organization.value.type);
  }
})

const clinicHaveDoctors = () => {
  return doctorsByOrganizationCount.value > 0;
}

const residenceHaveCaregivers = () => {
  return caregiversByOrganizationCount.value > 0;
}

const navigateToAddDoctor = () => {
  router.push({name: 'organization-doctor-new'});
}

</script>

<template>
  <div class="flex flex-column align-items-center, justify-content-center gap-2">
    <p v-if="!clinicHaveDoctors()">{{ t("organization.doctor-list.not-exist-doctors") }}</p>
    <pv-data-table
        v-else
        :loading="!doctorsLoaded"
        :value="doctorsByOrganization"
        paginator
        :rows="5"
        :rows-per-page-options="[5,10,20]"
        striped-rows
        table-style="min-width: 50rem"
    >
      <pv-column :header="t('organization.doctor-list.doctor-id')" field="id" sortable>
        <template #body="slotProps">
          <!-- Link with route param -->
          <RouterLink
              :to="{ name: 'doctor-details', params: { id: slotProps.data.id } }"
              class="text-blue-600 hover:underline"
          >
            {{ slotProps.data.id }}
          </RouterLink>
        </template>
      </pv-column>
      <pv-column :header="t('organization.doctor-list.doctor-name')" field="fullName" sortable>
        <template #body="slotProps">
          <!-- Link with route param -->
          <RouterLink
              :to="{ name: 'doctor-details', params: { id: slotProps.data.id } }"
              class="text-blue-600 hover:underline"
          >
            {{ slotProps.data.fullName }}
          </RouterLink>
        </template>
      </pv-column>
      <pv-column :header="t('organization.doctor-list.doctor-specialty')" field="specialty" sortable>
        <template #body="slotProps">
          <!-- Link with route param -->
          <RouterLink
              :to="{ name: 'doctor-details', params: { id: slotProps.data.id } }"
              class="text-blue-600 hover:underline"
          >
            {{ slotProps.data.specialty }}
          </RouterLink>
        </template>
      </pv-column>

    </pv-data-table>
    <div>
      <pv-button type="button" :label="t('organization.doctor-list.add-doctor-button')" @click="navigateToAddDoctor"
                 class="bg-blue-600 text-white-alpha-90"/>
    </div>
  </div>

</template>

<style scoped>

</style>