export class Alert {
    constructor({id = null, alertTitle = "", date = "", time = "", dataRegistered = "", reason = ""}) {
        this.id = id;
        this.alertTitle = alertTitle;
        this.date = date;
        this.time = time;
        this.dataRegistered = dataRegistered;
        this.reason = reason;
    }
}