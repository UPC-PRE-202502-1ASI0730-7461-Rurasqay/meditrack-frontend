import { Alert } from '../domain/model/alert.entity.js';

export class AlertAssembler {
    static toEntity(data) {
        return new Alert({
            alertId: data.alertId,
            deviceId: data.deviceId,
            eAlertType: data.eAlertType,
            message: data.message,
            dataRegistered: data.dataRegistered,
            registeredAt: data.registeredAt
        });
    }

    static toEntityCollection(dataArray) {
        return dataArray.map(data => this.toEntity(data));
    }
}
