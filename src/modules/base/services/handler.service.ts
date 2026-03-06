// import { Injectable } from '@angular/core'
// import { AlertService } from './alert.service'
// import { Router } from '@angular/router'

// type Subject = 'Error' | 'Warning' | 'Info' | 'Success'

// @Injectable({
//     providedIn: 'root',
// })
// export class HandlerService {
//     constructor(
//         private alertService: AlertService,
//         private router: Router,
//     ) {}

//     handleException(error: any) {
//         switch (error.error.code) {
//             case 'RCD-00001':
//                 this.alertService.showToast('Info', 'Data tidak ditemukan')
//                 break
//             case 'RCD-00002':
//                 this.alertService.showToast('Info', 'Data sudah ada')
//                 break
//             default:
//                 this.alertService.showToast(
//                     'Error',
//                     `Masalah Tidak Dijaga (${error.message})`,
//                 )
//             // this.router.navigate(['/500']);
//         }
//     }

//     handleAlert(subject: Subject, message: string) {
//         this.alertService.showToast(subject, message)
//     }

//     handleNavigate(...path: string[]) {
//         this.router.navigate(path)
//     }
// }

import { Injectable } from '@angular/core'
import { AlertService } from './alert.service'
import { Router } from '@angular/router'

type Subject = 'Error' | 'Warning' | 'Info' | 'Success'

interface ErrorEntry {
    subject: Subject
    message: string | ((error?: any) => string)
}

@Injectable({
    providedIn: 'root',
})
export class HandlerService {
    private errorMessages: Record<string, ErrorEntry> = {
        // RCD codes
        'RCD-00001': { subject: 'Info', message: 'Data tidak ditemukan' },
        'RCD-00002': { subject: 'Info', message: 'Data sudah ada' },

        // UEL codes
        'UEL-00000': {
            subject: 'Error',
            message: 'Profil belum lengkap (email dan telepon)',
        },
        'UEL-00001': {
            subject: 'Error',
            message: 'Riwayat Jabatan tidak ditemukan',
        },
        'UEL-00002': {
            subject: 'Error',
            message: 'Riwayat Pangkat tidak ditemukan',
        },
        'UEL-00003': {
            subject: 'Error',
            message: 'Riwayat Pendidikan tidak ditemukan',
        },
        'UEL-00004': {
            subject: 'Error',
            message: 'Riwayat Kinerja tidak ditemukan',
        },
        'UEL-00005': {
            subject: 'Error',
            message: 'Akumulasi Angka Kredit di bawah threshold',
        },
        'UEL-00006': {
            subject: 'Error',
            message: (error) =>
                `Rating Hasil tahun terakhir ke-${error?.year || '?'} tidak memenuhi syarat`,
        },
        'UEL-00007': {
            subject: 'Error',
            message: (error) =>
                `Rating Kinerja tahun terakhir ke-${error?.year || '?'} tidak memenuhi syarat`,
        },
        'UEL-00008': {
            subject: 'Error',
            message: (error) =>
                `Predikat Kinerja tahun terakhir ke-${error?.year || '?'} tidak memenuhi syarat`,
        },
        'UEL-00009': { subject: 'Info', message: 'Registrasi sudah ada' },
    }

    constructor(
        private alertService: AlertService,
        private router: Router,
    ) {}

    handleException(error: any) {
        const code = error?.error?.code
        const entry = this.errorMessages[code]

        if (entry) {
            const message =
                typeof entry.message === 'function'
                    ? entry.message(error?.error)
                    : entry.message
            this.alertService.showToast(entry.subject, message)
        } else {
            this.alertService.showToast(
                'Error',
                `Terjadi kesalahan tak terduga, silahkan coba lagi atau hubungi admin`,
            )
        }
    }

    handleAlert(subject: Subject, message: string, timer?: number) {
        this.alertService.showToast(subject, message, timer)
    }

    handleNavigate(...path: string[]) {
        this.router.navigate(path)
    }
}
