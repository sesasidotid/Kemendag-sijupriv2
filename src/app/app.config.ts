import { ApplicationConfig } from '@angular/core'
import { provideRouter } from '@angular/router'

import { routes } from './app.routes'
import { provideHttpClient, withInterceptors } from '@angular/common/http'
import { provideFirebaseApp, initializeApp } from '@angular/fire/app'
import { provideMessaging, getMessaging } from '@angular/fire/messaging'
import { FIREBASE_OPTIONS } from '@angular/fire/compat'
import { environment } from '../environments/environment'
import { APP_BASE_HREF } from '@angular/common'
import { RECAPTCHA_SETTINGS, RecaptchaSettings } from 'ng-recaptcha'
import { AuthInterceptor } from './interceptors/auth.interceptor'

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(routes),
        { provide: APP_BASE_HREF, useValue: environment.appBaseHref },
        provideHttpClient(withInterceptors([AuthInterceptor])),
        { provide: FIREBASE_OPTIONS, useValue: environment.firebaseConfig },
        provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
        provideMessaging(() => getMessaging()),
        {
            provide: RECAPTCHA_SETTINGS,
            useValue: {
                siteKey: environment.recaptcha.siteKey,
            } as RecaptchaSettings,
        },
    ],
}
