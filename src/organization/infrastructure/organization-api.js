import {BaseApi} from "../../shared/infrastructure/base-api.js";
import {BaseEndpoint} from "../../shared/infrastructure/base-endpoint.js";

const doctorsEndpointPath = import.meta.env.DOCTORS_ENDPOINT_PATH || '/doctors';
const caregiversEndpointPath = import.meta.env.CAREGIVERS_ENDPOINT_PATH || '/caregivers';
const organizationsEndpointPath = import.meta.env.ORGANIZATIONS_ENDPOINT_PATH || '/organizations';

export class OrganizationApi extends BaseApi {
    #doctorsEndpoint;
    #caregiversEndpoint;
    #organizationsEndpoint;

    constructor() {
        super();
        this.#doctorsEndpoint = new BaseEndpoint(this, doctorsEndpointPath);
        this.#caregiversEndpoint = new BaseEndpoint(this, caregiversEndpointPath);
        this.#organizationsEndpoint = new BaseEndpoint(this, organizationsEndpointPath);
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

    updateDoctor( resource){
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

    updateCaregiver( resource){
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

    updateOrganization( resource){
        return this.#organizationsEndpoint.update(resource.id, resource);
    }

    deleteOrganization(id){
        return this.#organizationsEndpoint.delete(id);
    }
}