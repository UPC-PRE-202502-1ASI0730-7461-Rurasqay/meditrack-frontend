export class Relative {
    constructor({
                    id = null,
                    userId = null,
                    firstName = "",
                    lastName = "",
                    phoneNumber = "",
                    planType = "freemium",
                    seniorCitizen = null,
                    seniorCitizenId = null
                }) {
        this._id = id;
        this._userId = userId;
        this._firstName = firstName;
        this._lastName = lastName;
        this._phoneNumber = phoneNumber;
        this._planType = planType;
        this._seniorCitizen = seniorCitizen;
        this._seniorCitizenId = seniorCitizenId;
    }

    get id() { return this._id; }
    set id(value) { this._id = value; }

    get userId() { return this._userId; }
    set userId(value) { this._userId = value; }

    get firstName() { return this._firstName; }
    set firstName(value) { this._firstName = value; }

    get lastName() { return this._lastName; }
    set lastName(value) { this._lastName = value; }

    get phoneNumber() { return this._phoneNumber; }
    set phoneNumber(value) { this._phoneNumber = value; }

    get planType() { return this._planType; }
    set planType(value) { this._planType = value; }

    get seniorCitizen() { return this._seniorCitizen; }
    set seniorCitizen(value) { this._seniorCitizen = value; }

    get seniorCitizenId() { return this._seniorCitizenId; }
    set seniorCitizenId(value) { this._seniorCitizenId = value; }

    get fullName() {
        return `${this._firstName} ${this._lastName}`.trim();
    }

    isPremium() {
        return this._planType === 'premium';
    }

    isFreemium() {
        return this._planType === 'freemium';
    }
}
