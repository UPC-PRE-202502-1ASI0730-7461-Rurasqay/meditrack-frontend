import {SeniorCitizen} from "./seniorCitizens.entity.js";

export class Relative {
    constructor({
                    id = null,
                    firstName = "",
                    lastName = "",
                    email = "",
                    password = "",
                    role = "relative",
                    planType = "",
                    creditCard = "" || null,
                    expirationDate = "" || null,
                    securityCode = "" || null,
                    seniorCitizen = null
                }) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.role = role;
        this.planType = planType;
        this.creditCard = creditCard;
        this.expirationDate = expirationDate;
        this.securityCode = securityCode;
        this.seniorCitizen = seniorCitizen
            ? new SeniorCitizen(seniorCitizen)
            : null;
    }
}
