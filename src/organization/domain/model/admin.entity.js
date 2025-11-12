export class Admin {
    constructor({
                    id = 0,
                    organizationId,
                    userId = null,
                    firstName = '',
                    lastName = ''
                } = {}) {
        this._id = id;
        this._organizationId = organizationId;
        this._userId = userId;
        this._firstName = firstName;
        this._lastName = lastName;
    }

    get id() {
        return this._id;
    }

    set id(value) {
        this._id = value;
    }

    get organizationId() {
        return this._organizationId;
    }

    set organizationId(value) {
        this._organizationId = value;
    }

    get userId() {
        return this._userId;
    }

    set userId(value) {
        this._userId = value;
    }

    get firstName() {
        return this._firstName;
    }

    set firstName(value) {
        this._firstName = value;
    }

    get lastName() {
        return this._lastName;
    }

    set lastName(value) {
        this._lastName = value;
    }

    get fullName() {
        return `${this._firstName} ${this._lastName}`.trim();
    }
}
