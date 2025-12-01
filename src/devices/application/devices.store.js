import { defineStore } from 'pinia';
import { DevicesApi } from '../infrastructure/devices-api.js';
import { AlertAssembler } from '../infrastructure/alert.assembler.js';
import { DeviceAssembler } from '../infrastructure/device.assembler.js';

const devicesApi = new DevicesApi();

export const useDevicesStore = defineStore('devices', {
    state: () => ({
        devices: [],
        alerts: [],
        currentDevice: null,
        measurements: {
            bloodPressure: [],
            temperature: [],
            oxygen: [],
            heartRate: []
        },
        loading: false,
        error: null
    }),

    getters: {
        getDeviceById: (state) => (id) => {
            return state.devices.find(device => device.deviceId === id);
        },
        
        getAlertsByDevice: (state) => (deviceId) => {
            return state.alerts.filter(alert => alert.deviceId === deviceId);
        }
    },

    actions: {
        async fetchDevices() {
            this.loading = true;
            this.error = null;
            try {
                const response = await devicesApi.getDevices();
                this.devices = DeviceAssembler.toEntityCollection(response.data);
                return this.devices;
            } catch (error) {
                this.error = error;
                console.error('Error fetching devices:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchDeviceById(id) {
            this.loading = true;
            this.error = null;
            try {
                const response = await devicesApi.getDeviceById(id);
                this.currentDevice = DeviceAssembler.toEntity(response.data);
                return this.currentDevice;
            } catch (error) {
                this.error = error;
                console.error('Error fetching device:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchAlerts() {
            this.loading = true;
            this.error = null;
            try {
                const response = await devicesApi.getAlerts();
                this.alerts = AlertAssembler.toEntityCollection(response.data);
                return this.alerts;
            } catch (error) {
                this.error = error;
                console.error('Error fetching alerts:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchAlertsByDevice(deviceId) {
            this.loading = true;
            this.error = null;
            try {
                const response = await devicesApi.getAlerts();
                const allAlerts = AlertAssembler.toEntityCollection(response.data);
                // Filter alerts for this device
                const deviceAlerts = allAlerts.filter(alert => alert.deviceId === deviceId);
                // Update state with all alerts
                this.alerts = allAlerts;
                return deviceAlerts;
            } catch (error) {
                this.error = error;
                console.error('Error fetching alerts by device:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async addBloodPressureMeasurement(deviceId, measurement) {
            this.loading = true;
            this.error = null;
            try {
                const response = await devicesApi.addBloodPressureMeasurement(deviceId, measurement);
                this.currentDevice = DeviceAssembler.toEntity(response.data);
                return this.currentDevice;
            } catch (error) {
                this.error = error;
                console.error('Error adding blood pressure measurement:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async addTemperatureMeasurement(deviceId, measurement) {
            this.loading = true;
            this.error = null;
            try {
                const response = await devicesApi.addTemperatureMeasurement(deviceId, measurement);
                this.currentDevice = DeviceAssembler.toEntity(response.data);
                return this.currentDevice;
            } catch (error) {
                this.error = error;
                console.error('Error adding temperature measurement:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async addOxygenMeasurement(deviceId, measurement) {
            this.loading = true;
            this.error = null;
            try {
                const response = await devicesApi.addOxygenMeasurement(deviceId, measurement);
                this.currentDevice = DeviceAssembler.toEntity(response.data);
                return this.currentDevice;
            } catch (error) {
                this.error = error;
                console.error('Error adding oxygen measurement:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async addHeartRateMeasurement(deviceId, measurement) {
            this.loading = true;
            this.error = null;
            try {
                const response = await devicesApi.addHeartRateMeasurement(deviceId, measurement);
                this.currentDevice = DeviceAssembler.toEntity(response.data);
                return this.currentDevice;
            } catch (error) {
                this.error = error;
                console.error('Error adding heart rate measurement:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchBloodPressureMeasurements(deviceId) {
            this.loading = true;
            this.error = null;
            try {
                const response = await devicesApi.getBloodPressureMeasurements(deviceId);
                // Transform backend data to chart format: [diastolic, systolic]
                this.measurements.bloodPressure = response.data.map(m => [m.diastolic, m.systolic]);
                return this.measurements.bloodPressure;
            } catch (error) {
                this.error = error;
                console.error('Error fetching blood pressure measurements:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchTemperatureMeasurements(deviceId) {
            this.loading = true;
            this.error = null;
            try {
                const response = await devicesApi.getTemperatureMeasurements(deviceId);
                // Transform backend data to chart format: celsius values
                this.measurements.temperature = response.data.map(m => m.celsius);
                return this.measurements.temperature;
            } catch (error) {
                this.error = error;
                console.error('Error fetching temperature measurements:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchOxygenMeasurements(deviceId) {
            this.loading = true;
            this.error = null;
            try {
                const response = await devicesApi.getOxygenMeasurements(deviceId);
                // Transform backend data to chart format: spo2 values
                this.measurements.oxygen = response.data.map(m => m.spo2);
                return this.measurements.oxygen;
            } catch (error) {
                this.error = error;
                console.error('Error fetching oxygen measurements:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchHeartRateMeasurements(deviceId) {
            this.loading = true;
            this.error = null;
            try {
                const response = await devicesApi.getHeartRateMeasurements(deviceId);
                // Transform backend data to chart format: bpm values
                this.measurements.heartRate = response.data.map(m => m.bpm);
                return this.measurements.heartRate;
            } catch (error) {
                this.error = error;
                console.error('Error fetching heart rate measurements:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchAllMeasurements(deviceId) {
            try {
                await Promise.all([
                    this.fetchBloodPressureMeasurements(deviceId),
                    this.fetchTemperatureMeasurements(deviceId),
                    this.fetchOxygenMeasurements(deviceId),
                    this.fetchHeartRateMeasurements(deviceId)
                ]);
            } catch (error) {
                console.error('Error fetching all measurements:', error);
                throw error;
            }
        }
    }
});
