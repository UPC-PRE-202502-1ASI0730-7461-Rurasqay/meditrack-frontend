    export class SignalVitals {
        constructor(
            {
                        bloodPressure =[],
                        heartRate = [],
                        temperature = [],
                        oxygenLevel = [],
                    }) {
            this.bloodPressure = bloodPressure;
            this.heartRate = heartRate;
            this.temperature = temperature;
            this.oxygenLevel = oxygenLevel;
        }
    }
