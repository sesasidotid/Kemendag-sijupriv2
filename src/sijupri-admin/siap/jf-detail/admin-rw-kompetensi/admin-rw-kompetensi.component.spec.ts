import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminRwKompetensiComponent } from './admin-rw-kompetensi.component';

describe('AdminRwKompetensiComponent', () => {
  let component: AdminRwKompetensiComponent;
  let fixture: ComponentFixture<AdminRwKompetensiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminRwKompetensiComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminRwKompetensiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
