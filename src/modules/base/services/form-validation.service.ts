import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';

@Injectable({
    providedIn: 'root'
})
export class FormValidationService {
    constructor() { }

    getErrorMessage(control: AbstractControl | null, controlName: string, label: string): string | null {
        if (!control || !control.errors || (!control.touched && !control.dirty)) {
            return null; // No error or untouched field
        }

        const errors = control.errors;

        if (errors['required']) {
            return `${label} tidak boleh kosong.`;
        }
        if (errors['email']) {
            return `Format ${label} tidak valid.`;
        }
        if (errors['minlength']) {
            return `${label} minimal ${errors['minlength'].requiredLength} karakter.`;
        }
        if (errors['pattern']) {
            switch (controlName) {
                case 'nip':
                    return `${label} harus terdiri dari 18 digit angka.`;
                case 'nik':
                    return `${label} harus terdiri dari 16 digit angka.`;
                case 'phone':
                    return `${label} harus terdiri dari 10 hingga 15 digit angka.`;
                default:
                    return `Format ${label} tidak valid.`;
            }
        }
        if (errors['mismatch']) {
            return `Password dan Konfirmasi Password tidak cocok.`;
        }

        return null; // Default case
    }
}
