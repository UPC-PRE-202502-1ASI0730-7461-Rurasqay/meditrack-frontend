import { Device } from '../domain/model/device.entity.js';

export class DeviceAssembler {
    static toEntity(data) {
        return new Device({
            deviceId: data.deviceId,
            model: data.model,
            status: data.status,
            holderId: data.holderId,
            holderType: data.holderType,
            measurements: data.measurements || []
        });
    }

    static toEntityCollection(dataArray) {
        return dataArray.map(data => this.toEntity(data));
    }
}
