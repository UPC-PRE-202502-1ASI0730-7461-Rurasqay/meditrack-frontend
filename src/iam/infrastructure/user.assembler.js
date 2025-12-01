import {User} from "../domain/model/user.entity.js";

export class UserAssembler {
    /**
     * Convert a single resource object into a User entity.
     * @param resource - The resource object from the API response.
     * @returns {User}
     */
    static toEntityFromResource(resource) {
        return new User(resource);
    }

    /**
     * Convert an API response containing multiple resources into an array of User entities.
     * @param response - The API response object form Axios.
     * @returns {User[]}
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status} - ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data["users"];

        return resources.map(resource => this.toEntityFromResource(resource));

    }

    /**
     * Convert an API response containing a single resource into a User entity.
     * @param response - The API response object from Axios.
     * @returns {User|null}
     */
    static toEntityFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status} - ${response.statusText}`);
            return null;
        }
        return this.toEntityFromResource(response.data);
    }
}