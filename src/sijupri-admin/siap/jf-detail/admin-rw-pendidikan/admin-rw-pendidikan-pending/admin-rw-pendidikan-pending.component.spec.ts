import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminRwPendidikanPendingComponent } from './admin-rw-pendidikan-pending.component';

describe('AdminRwPendidikanPendingComponent', () => {
  let component: AdminRwPendidikanPendingComponent;
  let fixture: ComponentFixture<AdminRwPendidikanPendingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminRwPendidikanPendingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminRwPendidikanPendingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
