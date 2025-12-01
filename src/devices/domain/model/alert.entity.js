export class Alert {
    constructor({
                    alertId = null,
                    deviceId = null,
                    eAlertType = "",
                    message = "",
                    dataRegistered = 0,
                    registeredAt = null
                }) {
        this._alertId = alertId;
        this._deviceId = deviceId;
        this._eAlertType = eAlertType;
        this._message = message;
        this._dataRegistered = dataRegistered;
        this._registeredAt = registeredAt;
    }

    get alertId() { return this._alertId; }
    set alertId(value) { this._alertId = value; }

    get deviceId() { return this._deviceId; }
    set deviceId(value) { this._deviceId = value; }

    get eAlertType() { return this._eAlertType; }
    set eAlertType(value) { this._eAlertType = value; }

    get message() { return this._message; }
    set message(value) { this._message = value; }

    get dataRegistered() { return this._dataRegistered; }
    set dataRegistered(value) { this._dataRegistered = value; }

    get registeredAt() { return this._registeredAt; }
    set registeredAt(value) { this._registeredAt = value; }

    get date() {
        return this._registeredAt ? new Date(this._registeredAt).toLocaleDateString() : '';
    }

    get time() {
        return this._registeredAt ? new Date(this._registeredAt).toLocaleTimeString() : '';
    }

    get alertTitle() {
        return this._eAlertType || 'Alert';
    }

    get reason() {
        return this._message || 'No reason provided';
    }
}
