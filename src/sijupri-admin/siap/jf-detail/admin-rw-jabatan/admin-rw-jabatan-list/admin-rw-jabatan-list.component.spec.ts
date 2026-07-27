import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminRwJabatanListComponent } from './admin-rw-jabatan-list.component';

describe('AdminRwJabatanListComponent', () => {
  let component: AdminRwJabatanListComponent;
  let fixture: ComponentFixture<AdminRwJabatanListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminRwJabatanListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminRwJabatanListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
