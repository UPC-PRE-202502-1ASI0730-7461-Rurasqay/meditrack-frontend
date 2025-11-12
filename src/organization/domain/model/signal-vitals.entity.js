export class SignalVitals {
    constructor({
                    bloodPressure = [],
                    heartRate = [],
                    temperature = [],
                    oxygenLevel = [],
                } = {}) {
        this._bloodPressure = bloodPressure;
        this._heartRate = heartRate;
        this._temperature = temperature;
        this._oxygenLevel = oxygenLevel;
    }

    get bloodPressure() {
        return this._bloodPressure;
    }

    get heartRate() {
        return this._heartRate;
    }

    get temperature() {
        return this._temperature;
    }

    get oxygenLevel() {
        return this._oxygenLevel;
    }
}
