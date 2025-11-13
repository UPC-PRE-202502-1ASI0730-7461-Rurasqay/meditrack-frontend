// alert.js

export class Alert {
    constructor({
                    id = null,
                    alertTitle = "",
                    date = "",
                    time = "",
                    dataRegistered = "",
                    reason = "",
                } = {}) {
        this._id = id;
        this._alertTitle = alertTitle;
        this._date = date;
        this._time = time;
        this._dataRegistered = dataRegistered;
        this._reason = reason;
    }

    get id() {
        return this._id;
    }

    get alertTitle() {
        return this._alertTitle;
    }

    get date() {
        return this._date;
    }

    get time() {
        return this._time;
    }

    get dataRegistered() {
        return this._dataRegistered;
    }

    get reason() {
        return this._reason;
    }
}
