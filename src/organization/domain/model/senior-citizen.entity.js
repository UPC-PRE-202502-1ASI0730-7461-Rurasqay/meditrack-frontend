import { Alert } from './alert.entity.js';
import {SignalVitals} from "./signal-vitals.entity.js";

export class SeniorCitizen {
    constructor({
                    id = 0,
                    organizationId,
                    firstName = '',
                    lastName = '',
                    birthDate = null,
                    age = 0,
                    gender = '',
                    weight = 0,
                    dni = '',
                    height = 0,
                    imageUrl = '',
                    deviceId = 0,
                    assignedDoctorId = null,
                    assignedCaregiverId = null,
                    planType = 'freemium',
                    signalVitals = null,
                    alerts = []
                } = {}) {
        this._id = id;
        this._organizationId = organizationId;
        this._firstName = firstName;
        this._lastName = lastName;

        if (birthDate) {
            this._birthDate = birthDate instanceof Date ? birthDate : new Date(birthDate);
        } else {
            const today = new Date();
            this._birthDate = new Date(today.getFullYear() - age, today.getMonth(), today.getDate());
        }

        this._age = age || this.calculateAge(this._birthDate);

        this._gender = gender;
        this._weight = weight;
        this._dni = dni;
        this._height = height;
        this._imageUrl = imageUrl;
        this._deviceId = deviceId;
        this._assignedDoctorId = assignedDoctorId;
        this._assignedCaregiverId = assignedCaregiverId;
        this._planType = planType;

        this._signalVitals = signalVitals ? new SignalVitals(signalVitals) : undefined;
        this._alerts = alerts ? alerts.map(a => new Alert(a)) : [];
    }

    get id() { return this._id; }
    set id(value) { this._id = value; }

    get organizationId() { return this._organizationId; }
    set organizationId(value) { this._organizationId = value; }

    get firstName() { return this._firstName; }
    set firstName(value) { this._firstName = value; }

    get lastName() { return this._lastName; }
    set lastName(value) { this._lastName = value; }

    get fullName() { return `${this._firstName} ${this._lastName}`.trim(); }

    get birthDate() { return this._birthDate; }
    set birthDate(value) {
        this._birthDate = value;
        this._age = this.calculateAge(value);
    }

    get age() { return this._age; }
    set age(value) {
        this._age = value;
        const today = new Date();
        this._birthDate = new Date(today.getFullYear() - value, today.getMonth(), today.getDate());
    }

    calculateAge(birthDate) {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    get gender() { return this._gender; }
    set gender(value) { this._gender = value; }

    get weight() { return this._weight; }
    set weight(value) { this._weight = value; }

    get dni() { return this._dni; }
    set dni(value) { this._dni = value; }

    get height() { return this._height; }
    set height(value) { this._height = value; }

    get imageUrl() { return this._imageUrl; }
    set imageUrl(value) { this._imageUrl = value; }

    get deviceId() { return this._deviceId; }
    set deviceId(value) { this._deviceId = value; }

    get assignedDoctorId() { return this._assignedDoctorId; }
    set assignedDoctorId(value) { this._assignedDoctorId = value; }

    get assignedCaregiverId() { return this._assignedCaregiverId; }
    set assignedCaregiverId(value) { this._assignedCaregiverId = value; }

    get planType() { return this._planType; }
    set planType(value) { this._planType = value; }

    get signalVitals() { return this._signalVitals; }

    get alerts() { return this._alerts || []; }

    isAssignedTo(personId) {
        return this._assignedDoctorId === personId || this._assignedCaregiverId === personId;
    }

    canBeAssignedToDoctor() {
        return this._assignedCaregiverId === null;
    }

    canBeAssignedToCaregiver() {
        return this._assignedDoctorId === null;
    }

    isAssignedToAnyDoctor() {
        return this._assignedDoctorId !== null;
    }

    isAssignedToAnyCaregiver() {
        return this._assignedCaregiverId !== null;
    }

    isAssignedToDoctor(doctorId) {
        return this._assignedDoctorId === doctorId;
    }

    isAssignedToCaregiver(caregiverId) {
        return this._assignedCaregiverId === caregiverId;
    }
}
