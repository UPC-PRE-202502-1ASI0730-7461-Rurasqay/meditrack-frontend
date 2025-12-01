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
        const type = this._type.toLowerCase();
        if (type === 'healthcenter') {
            const nameLower = this._name.toLowerCase();
            const isResidence = nameLower.includes('resident') || 
                               nameLower.includes('reposo') || 
                               nameLower.includes('nursing') || 
                               nameLower.includes('asilo');
            return !isResidence;
        }
        return type === 'clinic';
    }

    // Domain logic: Checks if this organization is a residence
    isResidence() {
        const type = this._type.toLowerCase();
        if (type === 'healthcenter') {
            const nameLower = this._name.toLowerCase();
            return nameLower.includes('resident') || 
                   nameLower.includes('reposo') || 
                   nameLower.includes('nursing') || 
                   nameLower.includes('asilo');
        }
        return type === 'resident' || type === 'residence';
    }
}
