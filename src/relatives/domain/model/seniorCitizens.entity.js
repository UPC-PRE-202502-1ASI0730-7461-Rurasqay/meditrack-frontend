import { SignalVitals } from "./signalVitals.entity.js";
import { Alert } from "./alert.entity.js";

export class SeniorCitizen {
    constructor({
                    firstName = "",
                    lastName = "",
                    age = 0,
                    dni = "",
                    gender = "",
                    height = 0,
                    weight = 0,
                    image = "",
                    signalVitals = {},
                    alerts = []
                }) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.age = age;
        this.dni = dni;
        this.gender = gender;
        this.height = height;
        this.weight = weight;
        this.image = image;
        this.signalVitals = new SignalVitals(signalVitals);
        this.alerts = Array.isArray(alerts)
            ? alerts.map(alert => new Alert(alert))
            : alerts;
    }
}
