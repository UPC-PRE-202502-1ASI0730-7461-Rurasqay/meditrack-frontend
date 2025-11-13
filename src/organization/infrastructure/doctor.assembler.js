import {Doctor} from "../domain/model/doctor.entity.js";
/** * Class DoctorAssembler
 * Responsible for converting raw API responses into Doctor entity instances.
 */
export class DoctorAssembler {
    /**
     * Converts a raw resource object into a Doctor entity.
     * @param resource
     * @returns {Doctor}
     */
    static toEntityFromResource(resource) {
        // Handle fullName from API by splitting it into firstName and lastName
        let firstName = resource.firstName || '';
        let lastName = resource.lastName || '';
        
        if (resource.fullName && !resource.firstName && !resource.lastName) {
            const nameParts = resource.fullName.trim().split(' ');
            firstName = nameParts[0] || '';
            lastName = nameParts.slice(1).join(' ') || '';
        }
        
        return new Doctor({
            ...resource,
            firstName,
            lastName
        });
    }

    /**
     * Converts an API response into an array of Doctor entities.
     * @param response - The API response object from Axios.
     * @returns {Doctor[]}
     */
    static toEntitiesFromResponse(response){
        if (response.status !== 200) {
            console.error(`${response.status} - ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data["doctors"];
        return resources.map(resource => this.toEntityFromResource(resource));
    }
}
