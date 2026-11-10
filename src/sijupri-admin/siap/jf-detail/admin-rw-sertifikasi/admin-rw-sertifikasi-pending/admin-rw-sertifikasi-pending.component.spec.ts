import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminRwSertifikasiPendingComponent } from './admin-rw-sertifikasi-pending.component';

describe('AdminRwSertifikasiPendingComponent', () => {
  let component: AdminRwSertifikasiPendingComponent;
  let fixture: ComponentFixture<AdminRwSertifikasiPendingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminRwSertifikasiPendingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminRwSertifikasiPendingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
