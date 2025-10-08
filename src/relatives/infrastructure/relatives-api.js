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
}