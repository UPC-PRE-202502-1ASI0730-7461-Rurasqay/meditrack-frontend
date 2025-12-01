export class Device {
    constructor({
                    deviceId = null,
                    model = "",
                    status = "",
                    holderId = null,
                    holderType = "",
                    measurements = []
                }) {
        this._deviceId = deviceId;
        this._model = model;
        this._status = status;
        this._holderId = holderId;
        this._holderType = holderType;
        this._measurements = measurements || [];
    }

    get deviceId() { return this._deviceId; }
    set deviceId(value) { this._deviceId = value; }

    get model() { return this._model; }
    set model(value) { this._model = value; }

    get status() { return this._status; }
    set status(value) { this._status = value; }

    get holderId() { return this._holderId; }
    set holderId(value) { this._holderId = value; }

    get holderType() { return this._holderType; }
    set holderType(value) { this._holderType = value; }

    get measurements() { return this._measurements; }
    set measurements(value) { this._measurements = value; }

    isActive() {
        return this._status === 'active';
    }
}
