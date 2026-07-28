import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminRwKinerjaListComponent } from './admin-rw-kinerja-list.component';

describe('AdminRwKinerjaListComponent', () => {
  let component: AdminRwKinerjaListComponent;
  let fixture: ComponentFixture<AdminRwKinerjaListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminRwKinerjaListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminRwKinerjaListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
