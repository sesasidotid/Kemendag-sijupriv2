import { ApplicationConfig } from '@angular/core'
import { provideRouter } from '@angular/router'

import { routes } from './app.routes'
import { provideHttpClient } from '@angular/common/http'
import { provideFirebaseApp, initializeApp } from '@angular/fire/app'
import { provideMessaging, getMessaging } from '@angular/fire/messaging'
import { FIREBASE_OPTIONS } from '@angular/fire/compat'
import { environment } from '../environments/environment'
import {
  RECAPTCHA_SETTINGS,
  RecaptchaFormsModule,
  RecaptchaModule,
  RecaptchaSettings
} from 'ng-recaptcha'

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    { provide: FIREBASE_OPTIONS, useValue: environment.firebaseConfig },
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideMessaging(() => getMessaging()),
    {
      provide: RECAPTCHA_SETTINGS,
      useValue: {
        siteKey: environment.recaptcha.siteKey
      } as RecaptchaSettings
    }
  ]
}
