import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AkpVerifikasiPelatihanComponent } from './akp-verifikasi-pelatihan.component';

describe('AkpVerifikasiPelatihanComponent', () => {
  let component: AkpVerifikasiPelatihanComponent;
  let fixture: ComponentFixture<AkpVerifikasiPelatihanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AkpVerifikasiPelatihanComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AkpVerifikasiPelatihanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
