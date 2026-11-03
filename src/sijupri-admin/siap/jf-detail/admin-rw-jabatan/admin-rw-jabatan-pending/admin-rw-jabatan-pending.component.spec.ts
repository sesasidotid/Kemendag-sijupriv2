import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminRwJabatanPendingComponent } from './admin-rw-jabatan-pending.component';

describe('AdminRwJabatanPendingComponent', () => {
  let component: AdminRwJabatanPendingComponent;
  let fixture: ComponentFixture<AdminRwJabatanPendingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminRwJabatanPendingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminRwJabatanPendingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
