import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomExportVerifikasiComponent } from './ukom-export-verifikasi.component';

describe('UkomExportVerifikasiComponent', () => {
  let component: UkomExportVerifikasiComponent;
  let fixture: ComponentFixture<UkomExportVerifikasiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomExportVerifikasiComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomExportVerifikasiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
