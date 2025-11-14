<script setup>
import {useI18n} from "vue-i18n";
import {useRouter} from "vue-router";
import useIAMStore from "../../application/iam.store.js";
import {useOrganizationStore} from "../../../organization/application/organization.store.js";
import {OrganizationApi} from "../../../organization/infrastructure/organization-api.js";
import {onMounted, ref} from "vue";
import {Button as PvButton, InputText as PvInputText, Password as PvPassword} from "primevue";
import {storeToRefs} from "pinia";

const {t} = useI18n();
const router = useRouter();
const store = useIAMStore();
const organizationStore = useOrganizationStore();
const organizationApi = new OrganizationApi();
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
  try {
    switch (user.role) {
      case "relative":
        // TODO: Implement relative dashboard
        alert('Relative dashboard not implemented yet');
        break;
      
      case "organizationAdmin":
        // For organization admins, entityId is the organizationId
        const organizationId = user.entityId;
        const userId = user.id;
        
        // Set current user in organization store
        organizationStore.setCurrentUser(userId, 'admin', organizationId);
        
        // Fetch organization to determine type and redirect accordingly
        const orgResponse = await organizationApi.getOrganizationById(organizationId);
        const organization = orgResponse.data;
        
        if (!organization) {
          alert('Could not retrieve organization information');
          return;
        }
        
        // Redirect based on organization type
        const orgType = organization.type;
        if (orgType === 'clinic') {
          router.push(`/organization/${organizationId}/admin/${userId}/doctors`);
        } else if (orgType === 'residence' || orgType === 'resident') {
          router.push(`/organization/${organizationId}/admin/${userId}/caregivers`);
        } else {
          // Fallback to senior-citizens
          router.push(`/organization/${organizationId}/admin/${userId}/senior-citizens`);
        }
        break;
      
      case "doctor":
        // For doctors, entityId is the doctor's ID
        // We need to fetch the doctor to get the organizationId
        const doctorResponse = await organizationApi.getDoctorById(user.entityId);
        const doctor = doctorResponse.data;
        
        if (!doctor || !doctor.organizationId) {
          alert('Could not retrieve doctor information');
          return;
        }
        
        // Set current user in organization store
        organizationStore.setCurrentUser(user.id, 'doctor', doctor.organizationId);
        
        router.push(`/organization/${doctor.organizationId}/doctor/${user.entityId}/senior-citizens`);
        break;
      
      case "caregiver":
        // For caregivers, entityId is the caregiver's ID
        // We need to fetch the caregiver to get the organizationId
        const caregiverResponse = await organizationApi.getCaregiverById(user.entityId);
        const caregiver = caregiverResponse.data;
        
        if (!caregiver || !caregiver.organizationId) {
          alert('Could not retrieve caregiver information');
          return;
        }
        
        // Set current user in organization store
        organizationStore.setCurrentUser(user.id, 'caregiver', caregiver.organizationId);
        
        router.push(`/organization/${caregiver.organizationId}/caregiver/${user.entityId}/senior-citizens`);
        break;
      
      default:
        alert('Unknown role');
        return;
    }
    
    const {id, role, entityId} = user;
    console.log(`User ${id} with role ${role} logged in. EntityId: ${entityId}`);
  } catch (error) {
    console.error('Login error:', error);
    alert('An error occurred during login. Please try again.');
  }
};

</script>

<template>
  <div class="login-form-container">
    <div class="login-form-header">
      <h2 class="login-form-title">{{ t('iam.login-form.login-title')}}</h2>
      <img src="/logo.png" alt="Logo" class="login-form-logo"/>
    </div>
    
    <div class="login-form-inputs">
      <pv-input-text 
        type="text" 
        :placeholder="t('iam.login-form.email-placeholder')" 
        v-model="email"  
        class="login-input w-full"
      />
      <pv-password 
        v-model="password" 
        :placeholder="t('iam.login-form.password-placeholder')" 
        :feedback="false" 
        toggle-mask 
        class="login-input w-full" 
        input-class="w-full"
      />
      <p class="forgot-password">{{ t('iam.login-form.forgot-password')}}</p>
    </div>
    
    <div class="login-form-button">
      <pv-button 
        type="button" 
        :label="t('iam.login-form.login-button')" 
        @click="handleLogin" 
        class="w-full"
      />
    </div>
    
    <div class="login-form-footer">
      <p class="signup-text">{{ t('iam.login-form.dont-have-account')}}</p>
      <a href="#" class="signup-link">{{ t('iam.login-form.sign-up')}}</a>
    </div>
  </div>
</template>

<style scoped>
.login-form-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  background: white;
  border-radius: 8px;
  padding: 2rem;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.login-form-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;
}

.login-form-title {
  color: rgba(0, 0, 0, 0.9);
  font-size: 2rem;
  font-weight: 500;
  text-align: center;
  margin: 0;
}

.login-form-logo {
  width: 5rem;
  height: 5rem;
}

.login-form-inputs {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.login-input {
  color: #000;
}

.login-input :deep(.p-password-input) {
  color: #000;
}

.forgot-password {
  color: #3b82f6;
  text-align: center;
  cursor: pointer;
  margin: 0;
}

.login-form-button {
  width: 100%;
}

.login-form-button :deep(.p-button) {
  background: #2563eb;
  border-color: #2563eb;
  color: white;
}

.login-form-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.signup-text {
  color: rgba(0, 0, 0, 0.8);
  margin: 0;
}

.signup-link {
  color: #93c5fd;
  text-decoration: none;
}

.signup-link:hover {
  text-decoration: underline;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .login-form-container {
    background: #2d2d2d;
    color: #e0e0e0;
  }
  
  .login-form-title {
    color: #e0e0e0;
  }
  
  .login-input :deep(.p-inputtext),
  .login-input :deep(.p-password-input) {
    background: #1e1e1e;
    color: #e0e0e0;
    border-color: #424242;
  }
  
  .login-input :deep(.p-inputtext:enabled:hover),
  .login-input :deep(.p-password-input:enabled:hover) {
    border-color: #64b5f6;
  }
  
  .forgot-password {
    color: #64b5f6;
  }
  
  .signup-text {
    color: #e0e0e0;
  }
  
  .signup-link {
    color: #64b5f6;
  }
}

/* Responsive adjustments */
@media (max-width: 786px) {
  .login-form-container {
    padding: 1.5rem;
    gap: 1.5rem;
    max-width: 100%;
  }
  
  .login-form-title {
    font-size: 1.5rem;
  }
  
  .login-form-logo {
    width: 4rem;
    height: 4rem;
  }
}

@media (max-width: 480px) {
  .login-form-container {
    padding: 1.25rem;
    gap: 1.25rem;
  }
  
  .login-form-title {
    font-size: 1.25rem;
  }
  
  .login-form-logo {
    width: 3.5rem;
    height: 3.5rem;
  }
}
</style>