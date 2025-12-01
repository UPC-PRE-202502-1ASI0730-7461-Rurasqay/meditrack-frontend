import { BaseApi } from "../../shared/infrastructure/base-api.js";
import { BaseEndpoint } from "../../shared/infrastructure/base-endpoint.js";

export class DevicesApi extends BaseApi {
    #devicesEndpoint;
    #alertsEndpoint;

    constructor() {
        super();
        this.#devicesEndpoint = new BaseEndpoint(this, 'devices');
        this.#alertsEndpoint = new BaseEndpoint(this, 'alerts');
    }

    // ========== Device Methods ==========
    
    getDevices() {
        return this.#devicesEndpoint.getAll();
    }

    getDeviceById(id) {
        return this.#devicesEndpoint.getById(id);
    }

    createDevice(resource) {
        return this.#devicesEndpoint.create(resource);
    }

    // ========== Alert Methods ==========
    
    getAlerts() {
        return this.#alertsEndpoint.getAll();
    }

    getAlertById(id) {
        return this.#alertsEndpoint.getById(id);
    }

    // ========== Measurement Methods ==========
    
    addBloodPressureMeasurement(deviceId, resource) {
        return this.http.post(`devices/${deviceId}/measurements/blood-pressure`, resource);
    }

    addTemperatureMeasurement(deviceId, resource) {
        return this.http.post(`devices/${deviceId}/measurements/temperature`, resource);
    }

    addOxygenMeasurement(deviceId, resource) {
        return this.http.post(`devices/${deviceId}/measurements/oxygen`, resource);
    }

    addHeartRateMeasurement(deviceId, resource) {
        return this.http.post(`devices/${deviceId}/measurements/heart-rate`, resource);
    }

    getBloodPressureMeasurements(deviceId) {
        return this.http.get(`devices/${deviceId}/measurements/blood-pressure`);
    }

    getTemperatureMeasurements(deviceId) {
        return this.http.get(`devices/${deviceId}/measurements/temperature`);
    }

    getOxygenMeasurements(deviceId) {
        return this.http.get(`devices/${deviceId}/measurements/oxygen`);
    }

    getHeartRateMeasurements(deviceId) {
        return this.http.get(`devices/${deviceId}/measurements/heart-rate`);
    }
}
