import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomIndikatorKompetensiAddComponent } from './ukom-indikator-kompetensi-add.component';

describe('UkomIndikatorKompetensiAddComponent', () => {
  let component: UkomIndikatorKompetensiAddComponent;
  let fixture: ComponentFixture<UkomIndikatorKompetensiAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomIndikatorKompetensiAddComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomIndikatorKompetensiAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
