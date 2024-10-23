import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RwKompetensiListComponent } from './rw-kompetensi-list.component';

describe('RwKompetensiListComponent', () => {
  let component: RwKompetensiListComponent;
  let fixture: ComponentFixture<RwKompetensiListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RwKompetensiListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RwKompetensiListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
