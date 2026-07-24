import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminRwPangkatListComponent } from './admin-rw-pangkat-list.component';

describe('AdminRwPangkatListComponent', () => {
  let component: AdminRwPangkatListComponent;
  let fixture: ComponentFixture<AdminRwPangkatListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminRwPangkatListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminRwPangkatListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
