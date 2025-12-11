import { Injectable } from '@angular/core'
import { Subject, Observable } from 'rxjs'
import { ConfirmationDialogComponent } from '../components/confirmation-dialog/confirmation-dialog.component'

interface ConfirmationResult {
    confirmed: boolean
    comment?: string
}

@Injectable({
    providedIn: 'root',
})
export class ConfirmationService {
    private confirmSubject!: Subject<ConfirmationResult> // Initialize with type
    private confirmationDialogComponent!: ConfirmationDialogComponent // Store a reference to the component

    constructor() {}

    // Set the component reference when the component is initialized
    setConfirmationDialogComponent(component: ConfirmationDialogComponent) {
        this.confirmationDialogComponent = component
    }

    /**
     * Opens the confirmation dialog with optional custom text.
     * @param withComment If true, a comment textarea will be visible.
     * @param title The title of the dialog. Defaults to "Apakah anda yakin?".
     * @param message The main message of the dialog. Defaults to "Aksi yang sudah dilakukan tidak dapat dikembalikan lagi.".
     * @param commentLabel The label for the comment textarea. Defaults to "Catatan".
     * @param confirmButtonText The text for the confirm button. Defaults to "Yakin".
     * @param cancelButtonText The text for the cancel button. Defaults to "Batal".
     * @param placeholder The placeholder text for the comment textarea. Defaults to "Silahkan masukkan catatan jika ada".
     * @returns An Observable that emits a ConfirmationResult when the dialog is closed.
     */

    open(
        withComment: boolean = false,
        title?: string,
        message?: string,
        commentLabel?: string,
        confirmButtonText?: string,
        cancelButtonText?: string,
        placeholder?: string,
    ): Observable<ConfirmationResult> {
        this.confirmSubject = new Subject<ConfirmationResult>()

        // Check if the component reference is available
        if (!this.confirmationDialogComponent) {
            console.error(
                'ConfirmationDialogComponent is not initialized. Make sure <app-confirmation-dialog> is present in the template.',
            )
            // Emit a cancelled result immediately
            setTimeout(() => {
                this.confirmSubject.next({ confirmed: false })
                this.confirmSubject.complete()
            })
            return this.confirmSubject.asObservable()
        }

        try {
            this.confirmationDialogComponent.open(
                withComment,
                title,
                message,
                commentLabel,
                confirmButtonText,
                cancelButtonText,
                placeholder,
            )
        } catch (error) {
            console.error('Error opening confirmation dialog:', error)
            // Emit a cancelled result if opening fails
            setTimeout(() => {
                this.confirmSubject.next({ confirmed: false })
                this.confirmSubject.complete()
            })
        }

        return this.confirmSubject.asObservable()
    }

    // Use this to emit when the dialog is confirmed
    confirm(confirmed: boolean, comment?: string) {
        if (this.confirmSubject) {
            // Ensure subject exists before emitting
            this.confirmSubject.next({ confirmed, comment })
            this.confirmSubject.complete()
        }
    }
}
