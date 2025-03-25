import { ConfirmationService } from './../../../../modules/base/services/confirmation.service';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { BidangJabatan } from '../../../../modules/maintenance/models/bidang-jabatan.model';
import { ApiService } from '../../../../modules/base/services/api.service';
import { ReactiveFormsModule, FormGroup, Validators, FormsModule, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HandlerService } from '../../../../modules/base/services/handler.service';
import { BehaviorSubject } from 'rxjs';
@Component({
    selector: 'app-bidang-jabatan-edit',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './bidang-jabatan-edit.component.html',
    styleUrl: './bidang-jabatan-edit.component.scss'
})
export class BidangJabatanEditComponent {
    @Input() bidangJabatan!: BidangJabatan;
    @Output() refreshList = new EventEmitter<void>()

    updateBidangJabatanForm!: FormGroup
    payload: {
        code: '',
        name: ''
    }
    submitLoading$ = new BehaviorSubject<boolean>(false)

    constructor(private apiService: ApiService, private confirmationService: ConfirmationService, private handlerService: HandlerService) { }

    ngOnInit() {
        this.handleFormInit()
        this.patchFormValue()
    }

    patchFormValue() {
        this.updateBidangJabatanForm.patchValue({
            code: this.bidangJabatan.code,
            name: this.bidangJabatan.name
        })
    }

    handleFormInit() {
        this.updateBidangJabatanForm = new FormGroup({
            code: new FormControl('', Validators.required),
            name: new FormControl('', Validators.required),
        })
    }

    onSubmit() {
        if (this.updateBidangJabatanForm.invalid) {
            return
        }

        this.confirmationService.open(false).subscribe({
            next: res => {
                if (!res.confirmed) {
                    return
                }

                this.submitLoading$.next(true)

                const payload = {
                    code: this.updateBidangJabatanForm.value.code,
                    name: this.updateBidangJabatanForm.value.name
                }

                this.apiService.putData('/api/v1/bidang_jabatan', payload).subscribe({
                    next: res => {
                        this.submitLoading$.next(false)
                        this.handlerService.handleAlert('Success', 'Berhasil mengubah data bidang jabatan')
                        this.refreshList.emit()
                    },
                    error: err => {
                        this.submitLoading$.next(false)
                        this.handlerService.handleAlert('Error', 'Gagal mengubah data bidang jabatan')
                    }
                })
            }
        })

    }
}
