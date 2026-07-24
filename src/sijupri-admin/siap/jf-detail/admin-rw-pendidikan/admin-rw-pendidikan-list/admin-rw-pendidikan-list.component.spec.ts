import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminRwPendidikanListComponent } from './admin-rw-pendidikan-list.component';

describe('AdminRwPendidikanListComponent', () => {
  let component: AdminRwPendidikanListComponent;
  let fixture: ComponentFixture<AdminRwPendidikanListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminRwPendidikanListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminRwPendidikanListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
