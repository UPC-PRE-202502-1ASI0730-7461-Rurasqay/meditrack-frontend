import {OrganizationApi} from "../infrastructure/organization-api.js";
import {computed, ref} from "vue";
import {DoctorAssembler} from "../domain/model/doctor.assembler.js";
import {OrganizationAssembler} from "../domain/model/organization.assembler.js";
import {CaregiverAssembler} from "../domain/model/caregiver.assembler.js";
import {defineStore} from "pinia";

const organizationApi = new OrganizationApi()

export const useOrganizationStore = defineStore('organization', () => {
    const organizations = ref(null);
    const doctors = ref([]);
    const caregivers = ref([]);
    const errors = ref([]);
    const organizationsLoaded = ref(false);
    const doctorsLoaded = ref(false);
    const caregiversLoaded = ref(false);

    const organization = ref(null);
    const doctorsByOrganization = ref([])
    const caregiversByOrganization = ref([])

    const doctorsByOrganizationCount = computed(() => {
        return doctorsLoaded.value ? doctorsByOrganization.value.length : 0;
    })

    const caregiversByOrganizationCount = computed(() => {
        return caregiversLoaded.value ? caregiversByOrganization.value.length : 0;
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
            caregivers.value = DoctorAssembler.toEntitiesFromResponse(response);
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
            const updatedDoctor = DoctorAssembler.toEntityFormResource(resource);
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
            const newDoctor = DoctorAssembler.toEntityFormResource(resource);
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
            const updatedCaregiver = CaregiverAssembler.toEntityFormResource(resource);
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
            const index = caregivers.value.findIndex(d => d.id === caregiver.id);
            if (index !== -1) {
                caregiversByOrganization.value.splice(index, 1);
            }
        }).catch((error) => {
            errors.value.push(error);
        })
    }

    function addCaregiver(caregiver) {
        organizationApi.createCaregiver(caregiver).then((response) => {
            const resource = response.data;
            const newCaregiver = CaregiverAssembler.toEntityFormResource(resource);
            caregiversByOrganization.value.push(newCaregiver);
        }).catch((error) => {
            errors.value.push(error);
        })
    }

    return {
        organizations,
        doctors,
        caregivers,
        errors,
        organizationsLoaded,
        doctorsLoaded,
        caregiversLoaded,
        organization,
        doctorsByOrganization,
        caregiversByOrganization,
        fetchOrganizationById,
        fetchDoctors,
        fetchCaregivers,
        getDoctorsById,
        updateDoctor,
        deleteDoctor,
        addDoctor,
        getCaregiversById,
        updateCaregiver,
        deleteCaregiver,
        addCaregiver,
        caregiversByOrganizationCount,
        doctorsByOrganizationCount,
    }
});