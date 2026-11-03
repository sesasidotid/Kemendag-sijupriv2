import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminRwSertifikasiComponent } from './admin-rw-sertifikasi.component';

describe('AdminRwSertifikasiComponent', () => {
  let component: AdminRwSertifikasiComponent;
  let fixture: ComponentFixture<AdminRwSertifikasiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminRwSertifikasiComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminRwSertifikasiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
