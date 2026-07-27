import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminRwKompetensiListComponent } from './admin-rw-kompetensi-list.component';

describe('AdminRwKompetensiListComponent', () => {
  let component: AdminRwKompetensiListComponent;
  let fixture: ComponentFixture<AdminRwKompetensiListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminRwKompetensiListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminRwKompetensiListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
