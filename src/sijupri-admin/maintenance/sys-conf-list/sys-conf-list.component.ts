import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ApiService } from '../../../modules/base/services/api.service'
import { SysConf } from '../../../modules/maintenance/models/sys-conf.model'
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators
} from '@angular/forms'
import { ConfirmationService } from '../../../modules/base/services/confirmation.service'
import { HandlerService } from '../../../modules/base/services/handler.service'

@Component({
    selector: 'app-sys-conf-list',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './sys-conf-list.component.html',
    styleUrl: './sys-conf-list.component.scss'
})
export class SysConfListComponent {
    sysConfList: SysConf[] = []
    isUpdate: boolean = false

    sysConfForm: FormGroup

    constructor(
        private apiService: ApiService,
        private confirmationService: ConfirmationService,
        private handlerService: HandlerService
    ) { }

    ngOnInit() {
        this.findAllSysConf()
    }

    toggleUkomStatus(code: string) {
        const currentValue = this.sysConfForm.get(code + '_value').value
        const newValue = currentValue === 'ya' ? 'tidak' : 'ya'
        this.sysConfForm.get(code + '_value').setValue(newValue)
    }

    findAllSysConf() {
        this.apiService.getData('/api/v1/sys_conf').subscribe({
            next: (response: any) => {
                const formControlMap: { [key: string]: any } = {}
                this.sysConfList = response.map(
                    (sysConf: { [key: string]: any }) => {
                        const sysConfModel = new SysConf(sysConf)
                        if (sysConfModel.type.startsWith('json')) sysConf['objectValue'] = JSON.parse(sysConfModel.value);
                        formControlMap[`${sysConfModel.code}_value`] =
                            new FormControl(sysConfModel.value, [
                                Validators.required,
                                Validators.pattern(
                                    new RegExp(sysConfModel.rule)
                                )
                            ])

                        return sysConf
                    }
                )

                this.sysConfForm = new FormGroup(formControlMap)
            }
        })
    }

    submit() {
        Object.keys(this.sysConfForm.controls).forEach(key => {
            const control = this.sysConfForm.get(key)
            if (control?.invalid) {
                console.log(
                    `FormControl '${key}' is invalid!`,
                    control.errors
                )
            }
        })

        this.sysConfForm.markAllAsTouched()
        if (!this.sysConfForm.valid) return
        this.confirmationService.open(false).subscribe({
            next: result => {
                if (!result.confirmed) return

                this.sysConfList.forEach(sysConf => {
                    sysConf.value =
                        this.sysConfForm.value[`${sysConf.code}_value`]
                })

                this.apiService
                    .putData('/api/v1/sys_conf/batch', {
                        systemConfigurationDtoList: this.sysConfList
                    })
                    .subscribe({
                        error: error =>
                            this.handlerService.handleException(error),
                        complete: () => {
                            this.isUpdate = false
                            this.findAllSysConf()
                        }
                    })
            }
        })
    }

    onSelectChange(event: Event, key: string, sysConf: SysConf) {
        const value = (event.target as HTMLSelectElement).value;
        
        console.log(JSON.stringify(sysConf.objectValue))
        sysConf.objectValue[key] = value;
        console.log(JSON.stringify(sysConf.objectValue))
        this.sysConfForm.get(`${sysConf.code}_value`)?.setValue(JSON.stringify(sysConf.objectValue));
    }

    extractRegexOptions(pattern: string): string[] {
        const match = pattern.match(/^\^\((.*?)\)\$$/);
        if (!match) return [];

        const options = match[1].split('|');
        return options;
    }

    extractJsonRegexOptions(pattern: string, key: string): string[] {
        const regex = new RegExp(`"${key}":"\\(([^)]+)\\)"`);
        const match = pattern.match(regex);
        if (!match) return [];
        return match[1].split('|')
    }

    jsonParse(jsonString: string) {
        return JSON.parse(jsonString);
    }
}
