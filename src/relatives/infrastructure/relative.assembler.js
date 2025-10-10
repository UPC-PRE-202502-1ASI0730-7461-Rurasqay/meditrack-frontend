import {RelativePremium} from "../domain/model/relative-premium.entity.js";
import {RelativeFreemium} from "../domain/model/relative-freemium.entity.js";

export class RelativeAssembler {
    static toEntityFromResource(resource) {

        console.log('Resource:', resource);

        if (!resource) return null;

        if (resource.planType === "premium") {
            return new RelativePremium(resource);
        } else {
            return new RelativeFreemium(resource);
        }
    }
}