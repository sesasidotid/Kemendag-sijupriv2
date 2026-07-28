import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminRwPangkatPendingComponent } from './admin-rw-pangkat-pending.component';

describe('AdminRwPangkatPendingComponent', () => {
  let component: AdminRwPangkatPendingComponent;
  let fixture: ComponentFixture<AdminRwPangkatPendingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminRwPangkatPendingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminRwPangkatPendingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
