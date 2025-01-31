import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomKompetensiAddComponent } from './ukom-kompetensi-add.component';

describe('UkomKompetensiAddComponent', () => {
  let component: UkomKompetensiAddComponent;
  let fixture: ComponentFixture<UkomKompetensiAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomKompetensiAddComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomKompetensiAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
