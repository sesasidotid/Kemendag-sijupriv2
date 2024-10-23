import { Injectable } from '@angular/core';
import { AlertService } from './alert.service';
import { Router } from '@angular/router';

type Subject = 'Error' | 'Warning' | "Info" | 'Success';

@Injectable({
  providedIn: 'root'
})
export class HandlerService {

  constructor(
    private alertService: AlertService,
    private router: Router
  ) { }

  handleException(error: any) {
    switch (error.error.code) {
      case "RCD-00001":
        this.alertService.showToast("Info", "Data tidak ditemukan")
        break;
      case "RCD-00002":
        this.alertService.showToast("Info", "Data sudah ada")
        break;
      default:
        this.alertService.showToast("Error", "Masalaha Tidak Dijaga")
        this.router.navigate(['/500']);
    }
  }

  handleAlert(subject: Subject, message: string) {
    this.alertService.showToast(subject, message);
  }

  handleNavigate(...path: string[]) {
    this.router.navigate(path);
  }


}
