import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminRwPendidikanComponent } from './admin-rw-pendidikan.component';

describe('AdminRwPendidikanComponent', () => {
  let component: AdminRwPendidikanComponent;
  let fixture: ComponentFixture<AdminRwPendidikanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminRwPendidikanComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminRwPendidikanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
