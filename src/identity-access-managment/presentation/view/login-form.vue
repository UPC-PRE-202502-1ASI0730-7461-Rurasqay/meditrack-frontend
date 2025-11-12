<script setup>
import {useI18n} from "vue-i18n";
import {useRouter} from "vue-router";
import useIAMStore from "../../application/iam.store.js";
import {onMounted, ref} from "vue";
import {Button as PvButton, InputText as PvInputText, Password as PvPassword} from "primevue";
import {storeToRefs} from "pinia";

const {t} = useI18n();
const router = useRouter();
const store = useIAMStore();
const email = ref('');
const password = ref('');

const {currentUser, currentUserLoaded, usersLoaded} = storeToRefs(store);
const {fetchUsers, login} = store;

onMounted( () => {
  if (!usersLoaded.value) {
     fetchUsers();
     console.log("usersLoaded:", usersLoaded.value);
  }
  if (currentUserLoaded.value && currentUser.value) {
    //router.push({ name: 'dashboard' });
  }
})

const handleLogin = async () => {
  const user = login(email.value, password.value);
  console.log(user);
  if (!user) {
    alert('Invalid credentials');
    return;
  }
  
  // Navigate based on user role
  switch (user.role){
    case "relative":
      // TODO: Implement relative dashboard
      alert('Relative dashboard not implemented yet');
      break;
    case "organizationAdmin":
      // For organization admins, entityId is the organizationId
      router.push(`/organization/${user.entityId}/doctors`);
      break;
    case "doctor":
      // For doctors, entityId is the doctor's ID
      // We need to fetch the doctor to get the organizationId
      // For now, we'll use a workaround by navigating to organization 1
      // TODO: Fetch doctor data to get the correct organizationId
      router.push(`/organization/1/senior-citizens`);
      break;
    case "caregiver":
      // For caregivers, entityId is the caregiver's ID
      // We need to fetch the caregiver to get the organizationId
      // For now, we'll use a workaround by navigating to organization 2
      // TODO: Fetch caregiver data to get the correct organizationId
      router.push(`/organization/2/senior-citizens`);
      break;
    default:
      alert('Unknown role');
      return;
  }
  
  const {id, role, entityId} = user;
  console.log(`User ${id} with role ${role} logged in. EntityId: ${entityId}`);
};

</script>

<template>
  <div class="inline-flex flex-column align-items-center justify-content-center gap-8 bg-white border-round-md my-auto p-4">
    <div class="flex flex-column align-items-center justify-content-center gap-5">
      <h2 class="text-black-alpha-90 text-5xl font-normal text-center">{{ t('iam.login-form.login-title')}}</h2>
      <img src="/logo.png" alt="Logo" class="w-6rem h-6rem mx-auto"/>
    </div>
    <div class="flex flex-column items-center justify-center gap-2 bg-white mx-auto">
      <pv-input-text type="text" :placeholder="t('iam.login-form.email-placeholder')" v-model="email"  class="login-input surface-800"/>
      <pv-password v-model="password" :placeholder="t('iam.login-form.password-placeholder')" :feedback="false" toggle-mask class="login-input surface-800" input-class="surface-800"/>
      <p class="text-blue-500">{{ t('iam.login-form.forgot-password')}}</p>
    </div>
    <div>
      <pv-button type="button" :label="t('iam.login-form.login-button')" @click="handleLogin" class="bg-blue-600 text-white-alpha-90"/>
    </div>
    <div class="flex flex-column items-center justify-center gap-0 bg-white">
      <p class="text-black-alpha-80">{{ t('iam.login-form.dont-have-account')}}</p>
      <a href="#" class="text-blue-300">{{ t('iam.login-form.sign-up')}}</a>
    </div>
  </div>
</template>

<style scoped>
h1 {
  max-width: 345px;
}

.login-input {
  color: #000;
}

:deep(.p-password-input) {
  color: #000;
}
</style>