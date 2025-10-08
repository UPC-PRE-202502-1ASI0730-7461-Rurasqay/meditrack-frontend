export class SignalVitals {
    constructor(
        {
                    bloodPressure = "",
                    heartRate = 0,
                    temperature = 0,
                    oxygenLevel = 0,
                }) {
        this.bloodPressure = bloodPressure;
        this.heartRate = heartRate;
        this.temperature = temperature;
        this.oxygenLevel = oxygenLevel | undefined;
    }
}
