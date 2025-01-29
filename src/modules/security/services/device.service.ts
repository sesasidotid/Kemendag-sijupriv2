import { Injectable } from '@angular/core'
import { v4 as uuidv4 } from 'uuid'

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  constructor () {}

  public getDeviceId () {
    let deviceId = localStorage.getItem('device_id')
    if (!deviceId) {
      deviceId = uuidv4()
      localStorage.setItem('device_id', deviceId)
    }
    return deviceId
  }
}
