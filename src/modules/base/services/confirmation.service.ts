import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ConfirmationDialogComponent } from '../components/confirmation-dialog/confirmation-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  private confirmSubject = new Subject<{ confirmed: boolean, comment?: string }>();
  private confirmationDialogComponent!: ConfirmationDialogComponent; // Store a reference to the component

  constructor() {}

  // Set the component reference when the component is initialized
  setConfirmationDialogComponent(component: ConfirmationDialogComponent) {
    this.confirmationDialogComponent = component;
  }

  // Open the dialog by calling the component's open method
  open(withComment: boolean = false) {
    this.confirmSubject = new Subject();
    this.confirmationDialogComponent.open(withComment); // Call the component's open method
    return this.confirmSubject.asObservable();
  }

  // Use this to emit when the dialog is confirmed
  confirm(confirmed: boolean, comment?: string) {
    this.confirmSubject.next({ confirmed, comment });
    this.confirmSubject.complete();
  }
}
