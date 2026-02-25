import { Injectable } from '@angular/core'

@Injectable({
    providedIn: 'root',
})
export class DeviceService {
    getDeviceId(): string {
        let deviceId = localStorage.getItem('device_id')

        if (!deviceId) {
            if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
                deviceId = crypto.randomUUID()
            } else {
                deviceId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                    var r = (Math.random() * 16) | 0,
                        v = c == 'x' ? r : (r & 0x3) | 0x8
                    return v.toString(16)
                })
            }
            localStorage.setItem('device_id', deviceId)
        }

        return deviceId
    }
}
