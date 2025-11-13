<script setup>
import {Doctor} from "../../domain/model/doctor.entity.js";
import {Button as PvButton, InputText as PvInputText} from "primevue";
import {useI18n} from "vue-i18n";
import {ref} from "vue";
import {useOrganizationStore} from "../../application/organization.store.js";
import {useRouter, useRoute} from "vue-router";
import {storeToRefs} from "pinia";

const router = useRouter();
const route = useRoute();

const {t} = useI18n();

const form = ref({
  name: '',
  lastname: '',
  age: null,
  specialty: '',
  phone: null,
  email: ''
});

const store = useOrganizationStore();

const {organization} = storeToRefs(store);
const {addDoctor} = store;

const navigateBack = () => {
  const organizationId = route.params.organizationId;
  router.push(`/organization/${organizationId}/doctors`);
}

const saveDoctor = () => {
  const organizationId = route.params.organizationId;
  const doctorData = {
    fullName: `${form.value.name} ${form.value.lastname}`,
    specialty: form.value.specialty,
    organizationId: organizationId ? parseInt(organizationId) : null
  };
  addDoctor(doctorData);
  navigateBack();
}

</script>

<template>
  <div>
    <form @submit.prevent="saveDoctor">
      <div class="flex flex-column justify-content-center align-items-center m-auto">
        <div class="flex">
          <div class="flex flex-column gap-2">
            <pv-input-text type="text" id="name" v-model="form.name"
                           :placeholder="t('organization.doctor-form.doctor-name')" required/>
            <pv-input-text type="number" id="age" v-model="form.age"
                           :placeholder="t('organization.doctor-form.doctor-age')" required/>
            <pv-input-text type="text" id="age" v-model="form.phone"
                           :placeholder="t('organization.doctor-form.doctor-phone')" required/>
          </div>
          <div class="flex flex-column gap-2">
            <pv-input-text type="text" id="name" v-model="form.lastname"
                           :placeholder="t('organization.doctor-form.doctor-lastname')" required/>
            <pv-input-text type="text" id="age" v-model="form.specialty"
                           :placeholder="t('organization.doctor-form.doctor-specialty')" required/>
            <pv-input-text type="email" id="age" v-model="form.email"
                           :placeholder="t('organization.doctor-form.doctor-email')" required/>
          </div>
        </div>
        <pv-button type="submit" :label="t('organization.doctor-form.save-doctor-button')"
                   class="bg-blue-600 text-white-alpha-90 mt-2"/>
      </div>
    </form>
  </div>
</template>
<style scoped>

</style>