import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminRwSertifikasiListComponent } from './admin-rw-sertifikasi-list.component';

describe('AdminRwSertifikasiListComponent', () => {
  let component: AdminRwSertifikasiListComponent;
  let fixture: ComponentFixture<AdminRwSertifikasiListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminRwSertifikasiListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminRwSertifikasiListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
