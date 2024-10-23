import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RwKompetensiAddComponent } from './rw-kompetensi-add.component';

describe('RwKompetensiAddComponent', () => {
  let component: RwKompetensiAddComponent;
  let fixture: ComponentFixture<RwKompetensiAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RwKompetensiAddComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RwKompetensiAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
