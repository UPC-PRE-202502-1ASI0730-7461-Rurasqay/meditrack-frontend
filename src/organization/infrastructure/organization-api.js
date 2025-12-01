import {BaseApi} from "../../shared/infrastructure/base-api.js";
import {BaseEndpoint} from "../../shared/infrastructure/base-endpoint.js";

const doctorsEndpointPath = import.meta.env.DOCTORS_ENDPOINT_PATH || '/doctors';
const caregiversEndpointPath = import.meta.env.CAREGIVERS_ENDPOINT_PATH || '/caregivers';
const organizationsEndpointPath = import.meta.env.ORGANIZATIONS_ENDPOINT_PATH || '/organizations';
const seniorCitizensEndpointPath = import.meta.env.SENIOR_CITIZENS_ENDPOINT_PATH || '/senior-citizens';
const adminsEndpointPath = import.meta.env.ADMINS_ENDPOINT_PATH || '/admins';

export class OrganizationApi extends BaseApi {
    #doctorsEndpoint;
    #caregiversEndpoint;
    #organizationsEndpoint;
    #seniorCitizensEndpoint;
    #adminsEndpoint;

    constructor() {
        super();
        this.#doctorsEndpoint = new BaseEndpoint(this, doctorsEndpointPath);
        this.#caregiversEndpoint = new BaseEndpoint(this, caregiversEndpointPath);
        this.#organizationsEndpoint = new BaseEndpoint(this, organizationsEndpointPath);
        this.#seniorCitizensEndpoint = new BaseEndpoint(this, seniorCitizensEndpointPath);
        this.#adminsEndpoint = new BaseEndpoint(this, adminsEndpointPath);
    }

    getDoctors() {
        return this.#doctorsEndpoint.getAll();
    }

    getDoctorById(id) {
        return this.#doctorsEndpoint.getById(id);
    }

    createDoctor(resource){
        return this.#doctorsEndpoint.create(resource);
    }

    updateDoctor(resource){
        return this.#doctorsEndpoint.update(resource.id, resource);
    }

    deleteDoctor(id){
        return this.#doctorsEndpoint.delete(id);
    }

    getCaregivers() {
        return this.#caregiversEndpoint.getAll();
    }

    getCaregiverById(id) {
        return this.#caregiversEndpoint.getById(id);
    }

    createCaregiver(resource){
        return this.#caregiversEndpoint.create(resource);
    }

    updateCaregiver(resource){
        return this.#caregiversEndpoint.update(resource.id, resource);
    }

    deleteCaregiver(id){
        return this.#caregiversEndpoint.delete(id);
    }

    getOrganizations() {
        return this.#organizationsEndpoint.getAll();
    }

    getOrganizationById(id) {
        return this.#organizationsEndpoint.getById(id);
    }

    createOrganization(resource){
        return this.#organizationsEndpoint.create(resource);
    }

    updateOrganization(resource){
        return this.#organizationsEndpoint.update(resource.id, resource);
    }

    deleteOrganization(id){
        return this.#organizationsEndpoint.delete(id);
    }

    // ========== Senior Citizens Methods ==========

    getSeniorCitizens() {
        return this.#seniorCitizensEndpoint.getAll();
    }

    getSeniorCitizenById(id) {
        return this.#seniorCitizensEndpoint.getById(id);
    }

    createSeniorCitizen(resource) {
        return this.#seniorCitizensEndpoint.create(resource);
    }

    updateSeniorCitizen(resource) {
        return this.#seniorCitizensEndpoint.update(resource.id, resource);
    }

    deleteSeniorCitizen(id) {
        return this.#seniorCitizensEndpoint.delete(id);
    }

    getSeniorCitizensByOrganization(organizationId) {
        return this.http.get(`${seniorCitizensEndpointPath}?organizationId=${organizationId}`);
    }

    getSeniorCitizensByDoctor(doctorId) {
        return this.http.get(`${seniorCitizensEndpointPath}?assignedDoctorId=${doctorId}`);
    }

    getSeniorCitizensByCaregiver(caregiverId) {
        return this.http.get(`${seniorCitizensEndpointPath}?assignedCaregiverId=${caregiverId}`);
    }

    // ========== Admin Methods ==========

    getAdmins() {
        return this.#adminsEndpoint.getAll();
    }

    getAdminById(id) {
        return this.#adminsEndpoint.getById(id);
    }

    getAdminByUserId(userId) {
        return this.http.get(`${adminsEndpointPath}?userId=${userId}`).then(response => {
            // Backend returns an array, so we need to extract the first element
            const admins = response.data;
            return Array.isArray(admins) && admins.length > 0 ? admins[0] : null;
        });
    }

    getAdminsByOrganization(organizationId) {
        return this.http.get(`${adminsEndpointPath}?organizationId=${organizationId}`);
    }

    getAdminByUserIdAndOrganizationId(userId, organizationId) {
        return this.http.get(`${adminsEndpointPath}?userId=${userId}&organizationId=${organizationId}`);
    }

    createAdmin(resource) {
        return this.#adminsEndpoint.create(resource);
    }

    updateAdmin(resource) {
        return this.#adminsEndpoint.update(resource.id, resource);
    }

    deleteAdmin(id) {
        return this.#adminsEndpoint.delete(id);
    }

    // ========== Assignment Methods ==========

    assignSeniorCitizenToDoctor(doctorId, seniorCitizenId) {
        // First get the senior citizen
        return this.http.get(`${seniorCitizensEndpointPath}/${seniorCitizenId}`)
            .then(response => {
                const seniorCitizenData = response.data;
                // Format birthDate to YYYY-MM-DD if it contains time
                let formattedBirthDate = seniorCitizenData.birthDate;
                if (formattedBirthDate && formattedBirthDate.includes('T')) {
                    formattedBirthDate = formattedBirthDate.split('T')[0];
                }
                // Create a clean payload with only the necessary fields
                const payload = {
                    id: seniorCitizenData.id,
                    organizationId: seniorCitizenData.organizationId,
                    firstName: seniorCitizenData.firstName,
                    lastName: seniorCitizenData.lastName,
                    birthDate: formattedBirthDate,
                    gender: seniorCitizenData.gender,
                    weight: seniorCitizenData.weight,
                    height: seniorCitizenData.height,
                    dni: seniorCitizenData.dni,
                    imageUrl: seniorCitizenData.imageUrl,
                    deviceId: seniorCitizenData.deviceId,
                    assignedDoctorId: doctorId,
                    assignedCaregiverId: null,
                    planType: seniorCitizenData.planType || 'freemium'
                };
                // Use PUT to update the entire senior citizen
                return this.http.put(`${seniorCitizensEndpointPath}/${seniorCitizenId}`, payload);
            });
    }

    unassignSeniorCitizenFromDoctor(doctorId, seniorCitizenId) {
        // First get the senior citizen
        return this.http.get(`${seniorCitizensEndpointPath}/${seniorCitizenId}`)
            .then(response => {
                const seniorCitizenData = response.data;
                // Format birthDate to YYYY-MM-DD if it contains time
                let formattedBirthDate = seniorCitizenData.birthDate;
                if (formattedBirthDate && formattedBirthDate.includes('T')) {
                    formattedBirthDate = formattedBirthDate.split('T')[0];
                }
                // Create a clean payload with only the necessary fields
                const payload = {
                    id: seniorCitizenData.id,
                    organizationId: seniorCitizenData.organizationId,
                    firstName: seniorCitizenData.firstName,
                    lastName: seniorCitizenData.lastName,
                    birthDate: formattedBirthDate,
                    gender: seniorCitizenData.gender,
                    weight: seniorCitizenData.weight,
                    height: seniorCitizenData.height,
                    dni: seniorCitizenData.dni,
                    imageUrl: seniorCitizenData.imageUrl,
                    deviceId: seniorCitizenData.deviceId,
                    assignedDoctorId: null,
                    assignedCaregiverId: seniorCitizenData.assignedCaregiverId,
                    planType: seniorCitizenData.planType || 'freemium'
                };
                // Use PUT to update the entire senior citizen
                return this.http.put(`${seniorCitizensEndpointPath}/${seniorCitizenId}`, payload);
            });
    }

    assignSeniorCitizenToCaregiver(caregiverId, seniorCitizenId) {
        // First get the senior citizen
        return this.http.get(`${seniorCitizensEndpointPath}/${seniorCitizenId}`)
            .then(response => {
                const seniorCitizenData = response.data;
                // Format birthDate to YYYY-MM-DD if it contains time
                let formattedBirthDate = seniorCitizenData.birthDate;
                if (formattedBirthDate && formattedBirthDate.includes('T')) {
                    formattedBirthDate = formattedBirthDate.split('T')[0];
                }
                // Create a clean payload with only the necessary fields
                const payload = {
                    id: seniorCitizenData.id,
                    organizationId: seniorCitizenData.organizationId,
                    firstName: seniorCitizenData.firstName,
                    lastName: seniorCitizenData.lastName,
                    birthDate: formattedBirthDate,
                    gender: seniorCitizenData.gender,
                    weight: seniorCitizenData.weight,
                    height: seniorCitizenData.height,
                    dni: seniorCitizenData.dni,
                    imageUrl: seniorCitizenData.imageUrl,
                    deviceId: seniorCitizenData.deviceId,
                    assignedDoctorId: null,
                    assignedCaregiverId: caregiverId,
                    planType: seniorCitizenData.planType || 'freemium'
                };
                console.log('Sending assignment payload:', payload);
                // Use PUT to update the entire senior citizen
                return this.http.put(`${seniorCitizensEndpointPath}/${seniorCitizenId}`, payload)
                    .then(response => {
                        console.log('Backend response:', response);
                        console.log('Updated senior citizen:', response.data);
                        return response;
                    })
                    .catch(error => {
                        console.error('Backend error:', error.response || error);
                        throw error;
                    });
            });
    }

    unassignSeniorCitizenFromCaregiver(caregiverId, seniorCitizenId) {
        // First get the senior citizen
        return this.http.get(`${seniorCitizensEndpointPath}/${seniorCitizenId}`)
            .then(response => {
                const seniorCitizenData = response.data;
                // Format birthDate to YYYY-MM-DD if it contains time
                let formattedBirthDate = seniorCitizenData.birthDate;
                if (formattedBirthDate && formattedBirthDate.includes('T')) {
                    formattedBirthDate = formattedBirthDate.split('T')[0];
                }
                // Create a clean payload with only the necessary fields
                const payload = {
                    id: seniorCitizenData.id,
                    organizationId: seniorCitizenData.organizationId,
                    firstName: seniorCitizenData.firstName,
                    lastName: seniorCitizenData.lastName,
                    birthDate: formattedBirthDate,
                    gender: seniorCitizenData.gender,
                    weight: seniorCitizenData.weight,
                    height: seniorCitizenData.height,
                    dni: seniorCitizenData.dni,
                    imageUrl: seniorCitizenData.imageUrl,
                    deviceId: seniorCitizenData.deviceId,
                    assignedDoctorId: seniorCitizenData.assignedDoctorId,
                    assignedCaregiverId: null,
                    planType: seniorCitizenData.planType || 'freemium'
                };
                // Use PUT to update the entire senior citizen
                return this.http.put(`${seniorCitizensEndpointPath}/${seniorCitizenId}`, payload);
            });
    }

    // ========== Organization-specific queries ==========

    getDoctorsByOrganization(organizationId) {
        return this.http.get(`${doctorsEndpointPath}?organizationId=${organizationId}`);
    }

    getCaregiversByOrganization(organizationId) {
        return this.http.get(`${caregiversEndpointPath}?organizationId=${organizationId}`);
    }

    getDoctorByUserId(userId) {
        return this.http.get(`${doctorsEndpointPath}?userId=${userId}`).then(response => {
            // Backend returns an array, so we need to extract the first element
            const doctors = response.data;
            return Array.isArray(doctors) && doctors.length > 0 ? doctors[0] : null;
        });
    }

    getCaregiverByUserId(userId) {
        return this.http.get(`${caregiversEndpointPath}?userId=${userId}`).then(response => {
            // Backend returns an array, so we need to extract the first element
            const caregivers = response.data;
            return Array.isArray(caregivers) && caregivers.length > 0 ? caregivers[0] : null;
        });
    }

    getDoctorByUserIdAndOrganizationId(userId, organizationId) {
        return this.http.get(`${doctorsEndpointPath}?userId=${userId}&organizationId=${organizationId}`);
    }

    getCaregiverByUserIdAndOrganizationId(userId, organizationId) {
        return this.http.get(`${caregiversEndpointPath}?userId=${userId}&organizationId=${organizationId}`);
    }
}