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
        return new Doctor(resource);
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
