import {RelativePremium} from "../domain/model/relative-premium.entity.js";
import {RelativeFreemium} from "../domain/model/relative-freemium.entity.js";
import {SeniorCitizenAssembler} from "../../organization/infrastructure/senior-citizen.assembler.js";

export class RelativeAssembler {
    static toEntityFromResource(resource) {
        if (!resource) return null;

        // Transform seniorCitizen to entity if present
        if (resource.seniorCitizen) {
            resource.seniorCitizen = SeniorCitizenAssembler.toEntityFromResource(resource.seniorCitizen);
        }

        // Backend returns camelCase
        if (resource.planType === "premium") {
            return new RelativePremium(resource);
        } else {
            return new RelativeFreemium(resource);
        }
    }

    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status} - ${response.statusText}`);
            return [];
        }
        const resources = response.data instanceof Array ? response.data : response.data["relatives"];
        return resources.map(resource => this.toEntityFromResource(resource));
    }
}