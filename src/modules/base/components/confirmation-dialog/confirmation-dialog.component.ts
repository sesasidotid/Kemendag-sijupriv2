// import { CommonModule } from '@angular/common'
// import { Component, EventEmitter, Output } from '@angular/core'
// import { FormsModule } from '@angular/forms'
// import { ConfirmationService } from '../../services/confirmation.service'

// @Component({
//     selector: 'app-confirmation-dialog',
//     standalone: true,
//     imports: [CommonModule, FormsModule],
//     templateUrl: './confirmation-dialog.component.html',
//     styleUrl: './confirmation-dialog.component.scss'
// })
// export class ConfirmationDialogComponent {
//     isVisible = false
//     isCommentEnabled = false
//     comment: string = ''

//     constructor(private confirmationDialogService: ConfirmationService) { }

//     ngOnInit() {
//         this.confirmationDialogService.setConfirmationDialogComponent(this)
//     }

//     open(withComment: boolean = false) {
//         this.isVisible = true
//         this.isCommentEnabled = withComment
//     }

//     close(result: boolean) {
//         this.isVisible = false
//         if (this.isCommentEnabled && result) {
//             this.confirmationDialogService.confirm(true, this.comment)
//         } else {
//             this.confirmationDialogService.confirm(result)
//         }
//         this.comment = ''
//     }
// }

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, Input, OnChanges, SimpleChanges } from '@angular/core'; // Import Input
import { FormsModule } from '@angular/forms';
import { ConfirmationService } from '../../services/confirmation.service';
import { LoadingButtonComponent } from '../loading-button/loading-button.component';
@Component({
    selector: 'app-confirmation-dialog',
    standalone: true,
    imports: [CommonModule, FormsModule, LoadingButtonComponent],
    templateUrl: './confirmation-dialog.component.html',
    styleUrl: './confirmation-dialog.component.scss'
})
export class ConfirmationDialogComponent {
    isVisible = false;
    isCommentEnabled = false;
    comment: string = '';

    // New @Input properties with default values
    @Input() title: string = 'Apakah anda yakin?';
    @Input() message: string = 'Aksi yang sudah dilakukan tidak dapat dikembalikan lagi.';
    @Input() commentLabel: string = 'Catatan';
    @Input() confirmButtonText: string = 'Yakin'; // Added for completeness
    @Input() cancelButtonText: string = 'Batal'; // Added for completeness
    @Input() placeholder: string = 'Tuliskan catatan atau revisi';

    constructor(private confirmationDialogService: ConfirmationService) { }

    ngOnInit() {
        this.confirmationDialogService.setConfirmationDialogComponent(this);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['isLoading']) {
            const current = changes['isLoading'].currentValue;
            const previous = changes['isLoading'].previousValue;
            console.log(`[ConfirmationDialog] isLoading changed from ${previous} to ${current}`);
        }
    }

    // Modified open method to allow setting custom texts
    open(
        withComment: boolean = false,
        title?: string,
        message?: string,
        commentLabel?: string,
        confirmButtonText?: string,
        cancelButtonText?: string,
        placeholder?: string
    ) {
        this.isVisible = true;
        this.isCommentEnabled = withComment;

        // Set custom text if provided, otherwise use defaults
        if (title) this.title = title;
        if (message) this.message = message;
        if (commentLabel) this.commentLabel = commentLabel;
        if (confirmButtonText) this.confirmButtonText = confirmButtonText;
        if (cancelButtonText) this.cancelButtonText = cancelButtonText;
        if (placeholder) this.placeholder = placeholder;

        this.comment = ''; // Clear comment on open
    }

    close(result: boolean) {
        this.isVisible = false;
        if (this.isCommentEnabled && result) {
            this.confirmationDialogService.confirm(true, this.comment);
        } else {
            this.confirmationDialogService.confirm(result);
        }
        this.comment = ''; // Clear comment after closing
        // Reset to default texts after closing, so next open doesn't retain old custom texts
        this.title = 'Apakah anda yakin?';
        this.message = 'Aksi yang sudah dilakukan tidak dapat dikembalikan lagi.';
        this.commentLabel = 'Catatan';
        this.confirmButtonText = 'Yakin';
        this.cancelButtonText = 'Batal';
        this.placeholder = 'Tuliskan catatan atau revisi';
    }
}