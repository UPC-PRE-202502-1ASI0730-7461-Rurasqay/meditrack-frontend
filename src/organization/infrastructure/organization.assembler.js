import {Organization} from "../domain/model/organization.entity.js";

/**
 * Class OrganizationAssembler
 * Responsible for converting raw API responses into Organization entity instances.
 */
export class OrganizationAssembler {

    /**
     * Converts a raw resource object into a Doctor entity.
     * @param resource
     * @returns {Organization}
     */
    static toEntityFromResource(resource) {
        return new Organization(resource);
    }

    /**
     * Converts an API response into an array of Doctor entities.
     * @param response - The API response object from Axios.
     * @returns {Organization[]}
     */
    static toEntitiesFromResponse(response){
        if (response.status !== 200) {
            console.error(`${response.status} - ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data["organizations"];
        return resources.map(resource => this.toEntityFromResource(resource));
    }
}
