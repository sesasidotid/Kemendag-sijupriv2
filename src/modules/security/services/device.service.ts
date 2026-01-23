import { Injectable } from '@angular/core'

@Injectable({
    providedIn: 'root',
})
export class DeviceService {
    getDeviceId(): string {
        let deviceId = localStorage.getItem('device_id')

        if (!deviceId) {
            deviceId = crypto.randomUUID()
            localStorage.setItem('device_id', deviceId)
        }

        return deviceId
    }
}
