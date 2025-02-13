import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { FcmService } from '../modules/notification-firebase/services/fcm.service'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'fe-template-angular'

  constructor (private fcmService: FcmService) {
    this.fcmService.currentToken$.subscribe(token => {})
  }
}
