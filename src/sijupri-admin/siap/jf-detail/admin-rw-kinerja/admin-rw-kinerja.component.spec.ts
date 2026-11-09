import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminRwKinerjaComponent } from './admin-rw-kinerja.component';

describe('AdminRwKinerjaComponent', () => {
  let component: AdminRwKinerjaComponent;
  let fixture: ComponentFixture<AdminRwKinerjaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminRwKinerjaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminRwKinerjaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
