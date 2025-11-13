// caregiver.js

export class Caregiver {
    constructor({
                    id = 0,
                    organizationId,
                    userId = null,
                    firstName = '',
                    lastName = '',
                    age = 0,
                    email = '',
                    phoneNumber = '',
                    imageUrl = '',
                    assignedSeniorIds = []
                } = {}) {
        this._id = id;
        this._organizationId = organizationId;
        this._userId = userId;
        this._firstName = firstName;
        this._lastName = lastName;
        this._age = age;
        this._email = email;
        this._phoneNumber = phoneNumber;
        this._imageUrl = imageUrl;
        this._assignedSeniorIds = assignedSeniorIds;
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

    get age() {
        return this._age;
    }
    set age(value) {
        this._age = value;
    }

    get email() {
        return this._email;
    }
    set email(value) {
        this._email = value;
    }

    get phoneNumber() {
        return this._phoneNumber;
    }
    set phoneNumber(value) {
        this._phoneNumber = value;
    }

    get imageUrl() {
        return this._imageUrl;
    }
    set imageUrl(value) {
        this._imageUrl = value;
    }

    get assignedSeniorIds() {
        return this._assignedSeniorIds;
    }
    set assignedSeniorIds(value) {
        this._assignedSeniorIds = value;
    }

    get fullName() {
        return `${this._firstName} ${this._lastName}`.trim();
    }

    // Domain logic: Assigns a senior citizen to this caregiver
    assignToSenior(seniorId) {
        if (!this._assignedSeniorIds.includes(seniorId)) {
            this._assignedSeniorIds.push(seniorId);
        }
    }

    // Domain logic: Unassigns a senior citizen from this caregiver
    unassignFromSenior(seniorId) {
        this._assignedSeniorIds = this._assignedSeniorIds.filter(id => id !== seniorId);
    }
}
