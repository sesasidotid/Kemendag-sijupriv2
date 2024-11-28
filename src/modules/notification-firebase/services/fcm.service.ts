import { Injectable } from '@angular/core';
import { AngularFireMessaging } from '@angular/fire/compat/messaging';
import { BehaviorSubject, map } from 'rxjs';
import { DeviceService } from '../../security/services/device.service';
import { ApiService } from '../../base/services/api.service';
import { FcmToken } from '../models/fcm-token.model';


@Injectable({
  providedIn: 'root'
})
export class FcmService {
  private currentToken = new BehaviorSubject<string | null>(null);

  public currentToken$ = this.currentToken.asObservable();

  constructor(
    private afMessaging: AngularFireMessaging,
    private deviceService: DeviceService,
    private apiService: ApiService
  ) {
    this.backgroundHandler();
    this.requestPermission();
    this.listenForTokenChanges();
    this.listenForMessages();
  }

  private backgroundHandler() {
    navigator.serviceWorker
      .register('/firebase-messaging-sw.js', { type: 'module' })
      .then((serviceWorkerRegistration) => {
        console.log('Service Worker registered:', serviceWorkerRegistration);
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  }

  private requestPermission() {
    this.afMessaging.requestToken.subscribe({
      next: (token) => {
        console.log('FCM Token:', token);
        this.currentToken.next(token);
      },
      error: (error) => {
        console.error('Unable to get permission to notify.', error);
      }
    });
  }

  private listenForTokenChanges() {
    this.afMessaging.tokenChanges.subscribe({
      next: (token) => {
        console.log('Token refreshed:', token);
        this.currentToken.next(token);
        this.updateToken(token)
      },
      error: (error) => {
        console.error('Error during token change detection:', error);
      }
    });
  }

  // Listen for incoming messages
  private listenForMessages() {
    this.afMessaging.messages.subscribe((message) => {
      console.log('New message received:', message);
    });
  }

  // Delete FCM token
  deleteToken(token: string) {
    this.afMessaging.deleteToken(token).subscribe({
      next: () => {
        console.log('Token deleted successfully.');
        this.currentToken.next(null);
      },
      error: (error) => {
        console.error('Error deleting token:', error);
      }
    });
  }

  private updateToken(token: string) {
    const fcmToken = new FcmToken();
    fcmToken.token = token;
    fcmToken.deviceId = this.deviceService.getDeviceId();

    this.apiService.putData('/api/v1/fcm_token', fcmToken).subscribe({
      next: () => {
        console.log("token changed");
      },
      error: (error) => {
        console.error(error);
      }
    });
  }
}
