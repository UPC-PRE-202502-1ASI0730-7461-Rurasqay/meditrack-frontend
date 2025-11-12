import { Admin } from "./admin.entity.js";

/**
 * Class AdminAssembler
 * Responsible for converting raw API responses into Admin entity instances.
 */
export class AdminAssembler {
    /**
     * Converts a raw resource object into an Admin entity.
     * @param resource
     * @returns {Admin}
     */
    static toEntityFromResource(resource) {
        return new Admin(resource);
    }

    /**
     * Converts an API response into an array of Admin entities.
     * @param response - The API response object from Axios.
     * @returns {Admin[]}
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status} - ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data["admins"];
        return resources.map(resource => this.toEntityFromResource(resource));
    }
}
