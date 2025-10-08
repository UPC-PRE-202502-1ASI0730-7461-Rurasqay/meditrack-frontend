/**
 * Class representing an Organization entity.
 * @class Organization
 */
export class Organization {
    /**
     * Creates an instance of Organization.
     * @param id - The unique identifier of the organization.
     * @param name - The name of the organization.
     * @param type - The type of the organization (e.g., hospital, clinic).
     */
    constructor({id = null, name = "", type =""}) {
        this.id = id;
        this.name = name;
        this.type = type;
    }
}