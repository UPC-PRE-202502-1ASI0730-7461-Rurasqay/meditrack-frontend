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
        const payload = {
            seniorCitizenId: seniorCitizenId,
            doctorId: doctorId
        };
        return this.http.post('doctor-assignments', payload);
    }

    unassignSeniorCitizenFromDoctor(doctorId, seniorCitizenId) {
        return this.http.delete(`doctor-assignments/doctors/${doctorId}/senior-citizens/${seniorCitizenId}`);
    }

    assignSeniorCitizenToCaregiver(caregiverId, seniorCitizenId) {
        const payload = {
            seniorCitizenId: seniorCitizenId,
            caregiverId: caregiverId
        };
        return this.http.post('caregiver-assignments', payload);
    }

    unassignSeniorCitizenFromCaregiver(caregiverId, seniorCitizenId) {
        return this.http.delete(`caregiver-assignments/caregivers/${caregiverId}/senior-citizens/${seniorCitizenId}`);
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