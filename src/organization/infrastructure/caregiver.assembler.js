import { Caregiver } from "../domain/model/caregiver.entity.js";

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
    static toEntityFromResource(resource) {
        // If fullName exists but firstName/lastName don't, split fullName
        if (resource.fullName && !resource.firstName && !resource.lastName) {
            const nameParts = resource.fullName.trim().split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';
            
            return new Caregiver({
                ...resource,
                firstName,
                lastName
            });
        }
        
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
        return resources.map(resource => this.toEntityFromResource(resource));
    }
}