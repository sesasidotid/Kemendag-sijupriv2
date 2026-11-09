import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminRwJabatanComponent } from './admin-rw-jabatan.component';

describe('AdminRwJabatanComponent', () => {
  let component: AdminRwJabatanComponent;
  let fixture: ComponentFixture<AdminRwJabatanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminRwJabatanComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminRwJabatanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
