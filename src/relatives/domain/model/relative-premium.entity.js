import {Relative} from "./relative.entity.js";

export class RelativePremium extends Relative {
    constructor(resource = {}) {
        super(resource);
    }

    downloadData() {
        console.log(`Downloading data for premium relative: ${this.firstName} ${this.lastName}`);
    }
}