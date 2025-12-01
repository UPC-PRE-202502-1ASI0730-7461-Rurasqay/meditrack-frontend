import {BaseApi} from "../../shared/infrastructure/base-api.js";
import {BaseEndpoint} from "../../shared/infrastructure/base-endpoint.js";

export class RelativesApi extends BaseApi {
    #relativesEndpoint;

    constructor() {
        super();
        this.#relativesEndpoint = new BaseEndpoint(this, 'relatives');
    }

    getRelatives(){
        return this.#relativesEndpoint.getAll();
    }

    getRelativeById(id){
        return this.#relativesEndpoint.getById(id);
    }

    getRelativeByUserId(userId) {
        return this.http.get(`relatives/user/${userId}`);
    }

    createRelative(resource) {
        return this.#relativesEndpoint.create(resource);
    }

    updateRelative(resource) {
        return this.#relativesEndpoint.update(resource.id, resource);
    }

    deleteRelative(id) {
        return this.#relativesEndpoint.delete(id);
    }
}