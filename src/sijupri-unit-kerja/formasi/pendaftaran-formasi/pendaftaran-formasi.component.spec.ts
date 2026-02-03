import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendaftaranFormasiComponent } from './pendaftaran-formasi.component';

describe('PendaftaranFormasiComponent', () => {
  let component: PendaftaranFormasiComponent;
  let fixture: ComponentFixture<PendaftaranFormasiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendaftaranFormasiComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PendaftaranFormasiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
