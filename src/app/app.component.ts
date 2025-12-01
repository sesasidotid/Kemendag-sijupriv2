import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { FcmService } from '../modules/notification-firebase/services/fcm.service'
import { FilePreviewComponent } from '@/modules/base/components/file-preview/file-preview.component'
import { ConfirmationDialogComponent } from '@/modules/base/components/confirmation-dialog/confirmation-dialog.component'

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, FilePreviewComponent, ConfirmationDialogComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent {
    title = 'fe-template-angular'

    constructor(private fcmService: FcmService) {
        this.fcmService.currentToken$.subscribe((token) => {})
    }
}
