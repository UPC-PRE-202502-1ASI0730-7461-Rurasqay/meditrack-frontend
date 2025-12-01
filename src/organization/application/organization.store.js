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
    
    // Request deduplication promises
    let fetchOrganizationsPromise = null;

    // Current context
    const organization = ref(null);
    const currentSeniorCitizen = ref(null);
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
        if (organizationsLoaded.value) {
            organization.value = organizations.value.find((item) => item.id === id);
            return Promise.resolve();
        }

        if (fetchOrganizationsPromise) {
            return fetchOrganizationsPromise.then(() => {
                organization.value = organizations.value.find((item) => item.id === id);
            });
        }

        fetchOrganizationsPromise = organizationApi.getOrganizations().then((response) => {
            organizations.value = OrganizationAssembler.toEntitiesFromResponse(response);
            organizationsLoaded.value = true;
            console.log("organizationLoaded", organizationsLoaded.value)
            console.log(organizations.value);

            organization.value = organizations.value.find((item) => item.id === id);
        }).catch((error) => {
            errors.value.push(error);
        }).finally(() => {
            fetchOrganizationsPromise = null;
        });

        return fetchOrganizationsPromise;
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

    function fetchDoctorsByOrganization(organizationId) {
        loading.value = true;
        return organizationApi.getDoctorsByOrganization(organizationId).then((response) => {
            const orgDoctors = DoctorAssembler.toEntitiesFromResponse(response);
            // Update the global doctors array and the filtered one
            doctors.value = orgDoctors;
            doctorsByOrganization.value = orgDoctors;
            doctorsLoaded.value = true;
            loading.value = false;
            console.log("fetchDoctorsByOrganization loaded", orgDoctors);
            return orgDoctors;
        }).catch((error) => {
            errors.value.push(error);
            loading.value = false;
            throw error;
        })
    }

    function fetchCaregiversByOrganization(organizationId) {
        loading.value = true;
        return organizationApi.getCaregiversByOrganization(organizationId).then((response) => {
            let orgCaregivers = CaregiverAssembler.toEntitiesFromResponse(response);
            
            // Manual filter because backend might return all records ignoring the query param
            if (organizationId) {
                const orgIdInt = parseInt(organizationId);
                orgCaregivers = orgCaregivers.filter(c => c.organizationId === orgIdInt);
            }
            
            // Update the global caregivers array and the filtered one
            caregivers.value = orgCaregivers;
            caregiversByOrganization.value = orgCaregivers;
            caregiversLoaded.value = true;
            loading.value = false;
            console.log("fetchCaregiversByOrganization loaded", orgCaregivers);
            return orgCaregivers;
        }).catch((error) => {
            errors.value.push(error);
            loading.value = false;
            throw error;
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

    function fetchSeniorCitizenById(id) {
        loading.value = true;
        let idInt = parseInt(id);
        
        // First check if we already have it in the local state
        const localSeniorCitizen = seniorCitizens.value.find((item) => item.id === idInt);
        if (localSeniorCitizen) {
            currentSeniorCitizen.value = localSeniorCitizen;
            loading.value = false;
            return Promise.resolve(localSeniorCitizen);
        }
        
        // If not, fetch from API
        return organizationApi.getSeniorCitizenById(id).then((response) => {
            const seniorCitizen = SeniorCitizenAssembler.toEntityFromResource(response.data);
            currentSeniorCitizen.value = seniorCitizen;
            
            // Update the local array if not already there
            const index = seniorCitizens.value.findIndex(sc => sc.id === idInt);
            if (index === -1) {
                seniorCitizens.value.push(seniorCitizen);
            } else {
                seniorCitizens.value[index] = seniorCitizen;
            }
            
            loading.value = false;
            return seniorCitizen;
        }).catch((error) => {
            errors.value.push(error);
            loading.value = false;
            throw error;
        })
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
        // For doctors and caregivers, currentUserId IS the entityId (doctor/caregiver ID)
        // For admins, it's the user ID
        return currentUserId.value;
    }

    function setCurrentUser(entityId, role, organizationIdValue) {
        // entityId is the doctor/caregiver ID for those roles, or user ID for admins
        currentUserId.value = entityId;
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
        currentSeniorCitizen,
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
        fetchDoctorsByOrganization,
        getDoctorsById,
        updateDoctor,
        deleteDoctor,
        addDoctor,
        
        // Caregiver methods
        fetchCaregivers,
        fetchCaregiversByOrganization,
        getCaregiversById,
        updateCaregiver,
        deleteCaregiver,
        addCaregiver,
        
        // Senior Citizen methods
        fetchSeniorCitizens,
        fetchSeniorCitizensByOrganization,
        getSeniorCitizenById,
        fetchSeniorCitizenById,
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