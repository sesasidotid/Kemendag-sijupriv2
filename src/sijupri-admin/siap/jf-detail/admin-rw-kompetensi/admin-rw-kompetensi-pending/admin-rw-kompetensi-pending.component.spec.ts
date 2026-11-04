import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminRwKompetensiPendingComponent } from './admin-rw-kompetensi-pending.component';

describe('AdminRwKompetensiPendingComponent', () => {
  let component: AdminRwKompetensiPendingComponent;
  let fixture: ComponentFixture<AdminRwKompetensiPendingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminRwKompetensiPendingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminRwKompetensiPendingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
