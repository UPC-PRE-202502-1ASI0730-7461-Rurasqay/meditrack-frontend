/**
 * Organization entity representing a clinic or residence.
 * Acts as the Aggregate Root for the organization bounded context.
 * This entity ensures multi-tenant data isolation.
 */
export class Organization {
    constructor({
                    id = 0,
                    name = '',
                    type = 'clinic' // puede ser 'clinic' o 'resident'
                } = {}) {
        this._id = id;
        this._name = name;
        this._type = type;
    }

    get id() {
        return this._id;
    }
    set id(value) {
        this._id = value;
    }

    get name() {
        return this._name;
    }
    set name(value) {
        this._name = value;
    }

    get type() {
        return this._type;
    }
    set type(value) {
        this._type = value;
    }

    // Domain logic: Checks if this organization is a clinic
    isClinic() {
        return this._type === 'clinic';
    }

    // Domain logic: Checks if this organization is a residence
    isResidence() {
        return this._type === 'resident';
    }
}
