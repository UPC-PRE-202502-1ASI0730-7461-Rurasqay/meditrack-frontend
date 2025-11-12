import {OrganizationApi} from "../infrastructure/organization-api.js";
import {computed, ref} from "vue";
import {DoctorAssembler} from "../infrastructure/doctor.assembler.js";
import {OrganizationAssembler} from "../infrastructure/organization.assembler.js";
import {CaregiverAssembler} from "../infrastructure/caregiver.assembler.js";
import {SeniorCitizenAssembler} from "../infrastructure/senior-citizen.assembler.js";
import {AdminAssembler} from "../infrastructure/admin.assembler.js";
import {defineStore} from "pinia";

const organizationApi = new OrganizationApi()

export const useOrganizationStore = defineStore('organization', () => {
    // State
    const organizations = ref(null);
    const doctors = ref([]);
    const caregivers = ref([]);
    const seniorCitizens = ref([]);
    const admins = ref([]);
    const errors = ref([]);
    
    // Loading states
    const organizationsLoaded = ref(false);
    const doctorsLoaded = ref(false);
    const caregiversLoaded = ref(false);
    const seniorCitizensLoaded = ref(false);
    const adminsLoaded = ref(false);
    const loading = ref(false);

    // Current context
    const organization = ref(null);
    const currentUserId = ref(null);
    const currentUserRole = ref('');
    const currentOrganizationId = ref(null);

    // Filtered data by organization
    const doctorsByOrganization = ref([])
    const caregiversByOrganization = ref([])

    // Computed properties
    const doctorsByOrganizationCount = computed(() => {
        return doctorsLoaded.value ? doctorsByOrganization.value.length : 0;
    })

    const caregiversByOrganizationCount = computed(() => {
        return caregiversLoaded.value ? caregiversByOrganization.value.length : 0;
    })

    const seniorCitizensCount = computed(() => {
        return seniorCitizensLoaded.value ? seniorCitizens.value.length : 0;
    })

    const filteredSeniorCitizens = computed(() => {
        const role = currentUserRole.value;
        const organizationIdValue = currentOrganizationId.value;
        const allSeniorCitizens = seniorCitizens.value;
        
        const seniorCitizensInOrganization = organizationIdValue > 0
            ? allSeniorCitizens.filter(sc => sc.organizationId === organizationIdValue)
            : [];
        
        if (role === 'doctor') {
            const doctorId = getCurrentUserEntityId();
            if (doctorId) {
                return seniorCitizensInOrganization.filter(sc =>
                    sc.assignedDoctorId === doctorId && 
                    sc.organizationId === organizationIdValue
                );
            }
            return [];
        }
        
        if (role === 'caregiver') {
            const caregiverId = getCurrentUserEntityId();
            if (caregiverId) {
                return seniorCitizensInOrganization.filter(sc =>
                    sc.assignedCaregiverId === caregiverId && 
                    sc.organizationId === organizationIdValue
                );
            }
            return [];
        }
        
        return seniorCitizensInOrganization;
    })

    function fetchOrganizationById(id) {
        return organizationApi.getOrganizations().then((response) => {
            organizations.value = OrganizationAssembler.toEntitiesFromResponse(response);
            organizationsLoaded.value = true;
            console.log("organizationLoaded", organizationsLoaded.value)
            console.log(organizations.value);

            organization.value = organizations.value.find((item) => item.id === id);
        }).catch((error) => {
            errors.value.push(error);
        })
    }

    function fetchDoctors() {
        return organizationApi.getDoctors().then((response) => {
            doctors.value = DoctorAssembler.toEntitiesFromResponse(response);
            doctorsLoaded.value = true;
            console.log("doctorsLoaded", doctorsLoaded.value)
            console.log(doctors.value);
            if (organization.value && organization.value.id) {
                doctorsByOrganization.value = doctors.value.filter((item) => item.organizationId === organization.value.id)
                console.log("doctorsByOrganization", doctorsByOrganization.value);
            } else {
                console.warn("Organization not loaded yet, cannot filter doctors");
            }
        }).catch((error) => {
            errors.value.push(error);
        })
    }

    function fetchCaregivers() {
        return organizationApi.getCaregivers().then((response) => {
            caregivers.value = CaregiverAssembler.toEntitiesFromResponse(response);
            caregiversLoaded.value = true;
            console.log("caregiversLoaded", caregiversLoaded.value)
            console.log(caregivers.value);
            if (organization.value && organization.value.id) {
                caregiversByOrganization.value = caregivers.value.filter((item) => item.organizationId === organization.value.id)
                console.log("caregiversByOrganization", caregiversByOrganization.value);
            } else {
                console.warn("Organization not loaded yet, cannot filter caregivers");
            }
        }).catch((error) => {
            errors.value.push(error);
        })
    }

    function getDoctorsById(id) {
        let idInt = parseInt(id);
        return doctorsByOrganization.value.filter((item) => item.id === idInt)
    }

    function updateDoctor(doctor) {
        organizationApi.updateDoctor(doctor).then((response) => {
            const resource = response.data;
            const updatedDoctor = DoctorAssembler.toEntityFromResource(resource);
            const index = doctors.value.findIndex(d => d.id === updatedDoctor.id);
            if (index !== -1) {
                doctorsByOrganization.value[index] = updatedDoctor;
            }
        }).catch((error) => {
            errors.value.push(error);
        })
    }

    function deleteDoctor(doctor) {
        organizationApi.deleteDoctor(doctor.id).then((response) => {
            const index = doctors.value.findIndex(d => d.id === doctor.id);
            if (index !== -1) {
                doctorsByOrganization.value.splice(index, 1);
            }
        }).catch((error) => {
            errors.value.push(error);
        })
    }

    function addDoctor(doctor) {
        organizationApi.createDoctor(doctor).then((response) => {
            const resource = response.data;
            const newDoctor = DoctorAssembler.toEntityFromResource(resource);
            doctorsByOrganization.value.push(newDoctor);
        }).catch((error) => {
            errors.value.push(error);
        })
    }

    function getCaregiversById(id) {
        let idInt = parseInt(id);
        return caregiversByOrganization.value.filter((item) => item.id === idInt)
    }

    function updateCaregiver(caregiver) {
        organizationApi.updateCaregiver(caregiver).then((response) => {
            const resource = response.data;
            const updatedCaregiver = CaregiverAssembler.toEntityFromResource(resource);
            const index = caregivers.value.findIndex(d => d.id === updatedCaregiver.id);
            if (index !== -1) {
                caregiversByOrganization.value[index] = updatedCaregiver;
            }
        }).catch((error) => {
            errors.value.push(error);
        })
    }

    function deleteCaregiver(caregiver) {
        organizationApi.deleteCaregiver(caregiver.id).then((response) => {
            // Remove from main caregivers array
            const index = caregivers.value.findIndex(c => c.id === caregiver.id);
            if (index !== -1) {
                caregivers.value.splice(index, 1);
            }
            // Remove from filtered array
            const filteredIndex = caregiversByOrganization.value.findIndex(c => c.id === caregiver.id);
            if (filteredIndex !== -1) {
                caregiversByOrganization.value.splice(filteredIndex, 1);
            }
        }).catch((error) => {
            errors.value.push(error);
        })
    }

    function addCaregiver(caregiver) {
        organizationApi.createCaregiver(caregiver).then((response) => {
            const resource = response.data;
            const newCaregiver = CaregiverAssembler.toEntityFromResource(resource);
            caregiversByOrganization.value.push(newCaregiver);
        }).catch((error) => {
            errors.value.push(error);
        })
    }

    // ========== Senior Citizens Methods ==========

    function fetchSeniorCitizens() {
        loading.value = true;
        return organizationApi.getSeniorCitizens().then((response) => {
            seniorCitizens.value = SeniorCitizenAssembler.toEntitiesFromResponse(response);
            seniorCitizensLoaded.value = true;
            console.log('seniorCitizensLoaded', seniorCitizensLoaded.value);
            console.log(seniorCitizens.value);
            loading.value = false;
        }).catch((error) => {
            errors.value.push(error);
            loading.value = false;
        })
    }

    function fetchSeniorCitizensByOrganization(organizationId) {
        loading.value = true;
        return organizationApi.getSeniorCitizensByOrganization(organizationId).then((response) => {
            seniorCitizens.value = SeniorCitizenAssembler.toEntitiesFromResponse(response);
            seniorCitizensLoaded.value = true;
            console.log('seniorCitizensLoaded for organization', organizationId, seniorCitizensLoaded.value);
            loading.value = false;
        }).catch((error) => {
            errors.value.push(error);
            loading.value = false;
        })
    }

    function getSeniorCitizenById(id) {
        let idInt = parseInt(id);
        return seniorCitizens.value.find((item) => item.id === idInt);
    }

    function addSeniorCitizen(seniorCitizen) {
        loading.value = true;
        organizationApi.createSeniorCitizen(seniorCitizen).then((response) => {
            const resource = response.data;
            const newSeniorCitizen = SeniorCitizenAssembler.toEntityFromResource(resource);
            seniorCitizens.value.push(newSeniorCitizen);
            loading.value = false;
        }).catch((error) => {
            errors.value.push(error);
            loading.value = false;
        })
    }

    function updateSeniorCitizen(seniorCitizen) {
        loading.value = true;
        organizationApi.updateSeniorCitizen(seniorCitizen).then((response) => {
            const resource = response.data;
            const updatedSeniorCitizen = SeniorCitizenAssembler.toEntityFromResource(resource);
            const index = seniorCitizens.value.findIndex(sc => sc.id === updatedSeniorCitizen.id);
            if (index !== -1) {
                seniorCitizens.value[index] = updatedSeniorCitizen;
            }
            loading.value = false;
        }).catch((error) => {
            errors.value.push(error);
            loading.value = false;
        })
    }

    function deleteSeniorCitizen(seniorCitizen) {
        loading.value = true;
        const id = typeof seniorCitizen === 'object' ? seniorCitizen.id : seniorCitizen;
        organizationApi.deleteSeniorCitizen(id).then(() => {
            const index = seniorCitizens.value.findIndex(sc => sc.id === id);
            if (index !== -1) {
                seniorCitizens.value.splice(index, 1);
            }
            loading.value = false;
        }).catch((error) => {
            errors.value.push(error);
            loading.value = false;
        })
    }

    // ========== Admin Methods ==========

    function fetchAdmins() {
        loading.value = true;
        return organizationApi.getAdmins().then((response) => {
            admins.value = AdminAssembler.toEntitiesFromResponse(response);
            adminsLoaded.value = true;
            console.log('adminsLoaded', adminsLoaded.value);
            loading.value = false;
        }).catch((error) => {
            errors.value.push(error);
            loading.value = false;
        })
    }

    function getAdminByUserId(userId) {
        loading.value = true;
        return organizationApi.getAdminByUserId(userId).then((response) => {
            if (response.data && response.data.length > 0) {
                const admin = AdminAssembler.toEntityFromResource(response.data[0]);
                loading.value = false;
                return admin;
            }
            loading.value = false;
            return null;
        }).catch((error) => {
            errors.value.push(error);
            loading.value = false;
            return null;
        })
    }

    // ========== Assignment Methods ==========

    function assignSeniorCitizenToDoctor(doctorId, seniorCitizenId) {
        loading.value = true;
        return organizationApi.assignSeniorCitizenToDoctor(doctorId, seniorCitizenId).then((response) => {
            const updatedSeniorCitizen = SeniorCitizenAssembler.toEntityFromResource(response.data);
            const index = seniorCitizens.value.findIndex(sc => sc.id === seniorCitizenId);
            if (index !== -1) {
                seniorCitizens.value[index] = updatedSeniorCitizen;
            }
            loading.value = false;
            return updatedSeniorCitizen;
        }).catch((error) => {
            errors.value.push(error);
            loading.value = false;
            throw error;
        })
    }

    function unassignSeniorCitizenFromDoctor(doctorId, seniorCitizenId) {
        loading.value = true;
        return organizationApi.unassignSeniorCitizenFromDoctor(doctorId, seniorCitizenId).then(() => {
            const seniorCitizen = seniorCitizens.value.find(sc => sc.id === seniorCitizenId);
            if (seniorCitizen) {
                seniorCitizen.assignedDoctorId = null;
            }
            loading.value = false;
        }).catch((error) => {
            errors.value.push(error);
            loading.value = false;
            throw error;
        })
    }

    function assignSeniorCitizenToCaregiver(caregiverId, seniorCitizenId) {
        loading.value = true;
        return organizationApi.assignSeniorCitizenToCaregiver(caregiverId, seniorCitizenId).then((response) => {
            const updatedSeniorCitizen = SeniorCitizenAssembler.toEntityFromResource(response.data);
            const index = seniorCitizens.value.findIndex(sc => sc.id === seniorCitizenId);
            if (index !== -1) {
                seniorCitizens.value[index] = updatedSeniorCitizen;
            }
            loading.value = false;
            return updatedSeniorCitizen;
        }).catch((error) => {
            errors.value.push(error);
            loading.value = false;
            throw error;
        })
    }

    function unassignSeniorCitizenFromCaregiver(caregiverId, seniorCitizenId) {
        loading.value = true;
        return organizationApi.unassignSeniorCitizenFromCaregiver(caregiverId, seniorCitizenId).then(() => {
            const seniorCitizen = seniorCitizens.value.find(sc => sc.id === seniorCitizenId);
            if (seniorCitizen) {
                seniorCitizen.assignedCaregiverId = null;
            }
            loading.value = false;
        }).catch((error) => {
            errors.value.push(error);
            loading.value = false;
            throw error;
        })
    }

    // ========== Helper Methods ==========

    function getCurrentOrganizationId() {
        return currentOrganizationId.value || (organization.value ? organization.value.id : 0);
    }

    function getInstitutionEmailDomain() {
        if (!organization.value || !organization.value.name) {
            return '';
        }
        const domain = organization.value.name
            .toLowerCase()
            .replace(/\s+/g, '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
        return `@${domain}.com`;
    }

    function getCurrentUserRole() {
        return currentUserRole.value;
    }

    function getCurrentUserEntityId() {
        const userId = currentUserId.value;
        if (!userId) return null;
        
        const role = getCurrentUserRole();
        if (!role) return null;

        if (role === 'doctor') {
            const doctor = doctors.value.find(d => d.userId === userId);
            return doctor ? doctor.id : null;
        } else if (role === 'caregiver') {
            const caregiver = caregivers.value.find(c => c.userId === userId);
            return caregiver ? caregiver.id : null;
        }

        return null;
    }

    function setCurrentUser(userId, role, organizationIdValue) {
        currentUserId.value = userId;
        currentUserRole.value = role;
        currentOrganizationId.value = organizationIdValue;
    }

    function isSeniorCitizensLoadedForOrganization(organizationId) {
        return seniorCitizensLoaded.value && currentOrganizationId.value === organizationId;
    }

    function isDoctorsLoadedForOrganization(organizationId) {
        return doctorsLoaded.value && currentOrganizationId.value === organizationId;
    }

    function isCaregiversLoadedForOrganization(organizationId) {
        return caregiversLoaded.value && currentOrganizationId.value === organizationId;
    }

    return {
        // State
        organizations,
        doctors,
        caregivers,
        seniorCitizens,
        admins,
        errors,
        organizationsLoaded,
        doctorsLoaded,
        caregiversLoaded,
        seniorCitizensLoaded,
        adminsLoaded,
        loading,
        organization,
        doctorsByOrganization,
        caregiversByOrganization,
        
        // Computed
        caregiversByOrganizationCount,
        doctorsByOrganizationCount,
        seniorCitizensCount,
        filteredSeniorCitizens,
        
        // Organization methods
        fetchOrganizationById,
        
        // Doctor methods
        fetchDoctors,
        getDoctorsById,
        updateDoctor,
        deleteDoctor,
        addDoctor,
        
        // Caregiver methods
        fetchCaregivers,
        getCaregiversById,
        updateCaregiver,
        deleteCaregiver,
        addCaregiver,
        
        // Senior Citizen methods
        fetchSeniorCitizens,
        fetchSeniorCitizensByOrganization,
        getSeniorCitizenById,
        addSeniorCitizen,
        updateSeniorCitizen,
        deleteSeniorCitizen,
        
        // Admin methods
        fetchAdmins,
        getAdminByUserId,
        
        // Assignment methods
        assignSeniorCitizenToDoctor,
        unassignSeniorCitizenFromDoctor,
        assignSeniorCitizenToCaregiver,
        unassignSeniorCitizenFromCaregiver,
        
        // Helper methods
        getCurrentOrganizationId,
        getInstitutionEmailDomain,
        getCurrentUserRole,
        getCurrentUserEntityId,
        setCurrentUser,
        isSeniorCitizensLoadedForOrganization,
        isDoctorsLoadedForOrganization,
        isCaregiversLoadedForOrganization,
    }
});