import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminRwKinerjaPendingComponent } from './admin-rw-kinerja-pending.component';

describe('AdminRwKinerjaPendingComponent', () => {
  let component: AdminRwKinerjaPendingComponent;
  let fixture: ComponentFixture<AdminRwKinerjaPendingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminRwKinerjaPendingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminRwKinerjaPendingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
