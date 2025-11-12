import { SeniorCitizen } from "./senior-citizen.entity.js";

/**
 * Class SeniorCitizenAssembler
 * Responsible for converting raw API responses into SeniorCitizen entity instances.
 */
export class SeniorCitizenAssembler {
    /**
     * Converts a raw resource object into a SeniorCitizen entity.
     * @param resource
     * @returns {SeniorCitizen}
     */
    static toEntityFromResource(resource) {
        return new SeniorCitizen(resource);
    }

    /**
     * Converts an API response into an array of SeniorCitizen entities.
     * @param response - The API response object from Axios.
     * @returns {SeniorCitizen[]}
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status} - ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data["seniorCitizens"];
        return resources.map(resource => this.toEntityFromResource(resource));
    }
}
