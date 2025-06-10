import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomIndikatorKompetensiDetailComponent } from './ukom-indikator-kompetensi-detail.component';

describe('UkomIndikatorKompetensiDetailComponent', () => {
  let component: UkomIndikatorKompetensiDetailComponent;
  let fixture: ComponentFixture<UkomIndikatorKompetensiDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomIndikatorKompetensiDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomIndikatorKompetensiDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
