import { Caregiver } from "./caregiver.entity.js";

/**
 * Class CaregiverAssembler
 * Responsible for converting raw API responses into Caregiver entity instances.
 */
export class CaregiverAssembler {
    /**
     * Converts a raw resource object into a Caregiver entity.
     * @param resource
     * @returns {Caregiver}
     */
    static toEntityFormResource(resource) {
        return new Caregiver(resource);
    }

    /**
     * Converts an API response into an array of Caregiver entities.
     * @param response - The API response object from Axios.
     * @returns {Caregiver[]}
     */
    static toEntitiesFromResponse(response){
        if (response.status !== 200) {
            console.error(`${response.status} - ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data["caregivers"];
        return resources.map(resource => this.toEntityFormResource(resource));
    }
}