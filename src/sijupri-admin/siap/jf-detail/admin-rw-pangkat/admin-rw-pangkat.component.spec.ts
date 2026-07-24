import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminRwPangkatComponent } from './admin-rw-pangkat.component';

describe('AdminRwPangkatComponent', () => {
  let component: AdminRwPangkatComponent;
  let fixture: ComponentFixture<AdminRwPangkatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminRwPangkatComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminRwPangkatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
