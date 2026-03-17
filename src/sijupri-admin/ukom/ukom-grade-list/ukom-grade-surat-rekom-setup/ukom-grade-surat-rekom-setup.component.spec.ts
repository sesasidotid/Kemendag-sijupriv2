import { ComponentFixture, TestBed } from '@angular/core/testing'
import { of } from 'rxjs'

import { UkomGradeSuratRekomSetupComponent } from './ukom-grade-surat-rekom-setup.component'
import { SuratRekomService } from '@/modules/ukom/services/surat-rekom.service'
import { HandlerService } from '@/modules/base/services/handler.service'

describe('UkomGradeSuratRekomSetupComponent', () => {
    let component: UkomGradeSuratRekomSetupComponent
    let fixture: ComponentFixture<UkomGradeSuratRekomSetupComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [UkomGradeSuratRekomSetupComponent],
            providers: [
                {
                    provide: SuratRekomService,
                    useValue: {
                        previewSuratRekom: () =>
                            of({ baseTemplate: '', template: '' }),
                        getRekomCounter: () => of({ code: 'REKOM_UKOM', num: 1 }),
                        updateRekomCounter: () =>
                            of({ code: 'REKOM_UKOM', num: 1 }),
                        setupSuratRekom: () => of('ok'),
                    },
                },
                {
                    provide: HandlerService,
                    useValue: {
                        handleAlert: jasmine.createSpy('handleAlert'),
                        handleException: jasmine.createSpy('handleException'),
                    },
                },
            ],
        }).compileComponents()

        fixture = TestBed.createComponent(UkomGradeSuratRekomSetupComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
