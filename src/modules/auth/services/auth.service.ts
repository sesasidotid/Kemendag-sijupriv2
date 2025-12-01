import { Injectable } from '@angular/core'
import { ApiService } from '../../base/services/api.service'
import { Auth } from '../models/auth.model'
import { catchError, map, Observable } from 'rxjs'
import { AuthResponse } from '../models/auth-response.model'
import { DeviceService } from '../../security/services/device.service'

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    readonly BASE_PATH = '/oauth/token'

    constructor(
        private apiService: ApiService,
        private deviceService: DeviceService,
    ) {}

    login(auth: Auth): Observable<AuthResponse> {
        auth.grantType = 'password'
        auth.channel_code = 'WEB'
        auth.deviceId = this.deviceService.getDeviceId()

        return this.apiService
            .auth(this.BASE_PATH, auth, {
                Authorization:
                    'Basic c2lqdXByaS13ZWI6c2lqdXByaS13ZWJQQHNzdzByZA==',
            })
            .pipe(
                map((response: any) => new AuthResponse(response)),
                catchError((error) => {
                    throw error
                }),
            )
    }

    loginCAT(auth: Auth): Observable<AuthResponse> {
        auth.grantType = 'password'
        auth.channel_code = 'WEB'
        auth.deviceId = this.deviceService.getDeviceId()

        return this.apiService
            .auth(this.BASE_PATH, auth, {
                Authorization:
                    'Basic c2l1a29tLXBhcnRpY2lwYW50OnNpdWtvbS1wYXJ0aWNpcGFudFBAc3N3MHJk',
            })
            .pipe(
                map((response: any) => new AuthResponse(response)),
                catchError((error) => {
                    throw error
                }),
            )
    }
}
