import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomGradeSuratRekomSetupComponent } from './ukom-grade-surat-rekom-setup.component';

describe('UkomGradeSuratRekomSetupComponent', () => {
    let component: UkomGradeSuratRekomSetupComponent;
    let fixture: ComponentFixture<UkomGradeSuratRekomSetupComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [UkomGradeSuratRekomSetupComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(UkomGradeSuratRekomSetupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
