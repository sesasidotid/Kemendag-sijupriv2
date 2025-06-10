import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomKompetensiDetailPagableComponent } from './ukom-kompetensi-detail-pagable.component';

describe('UkomKompetensiDetailPagableComponent', () => {
  let component: UkomKompetensiDetailPagableComponent;
  let fixture: ComponentFixture<UkomKompetensiDetailPagableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomKompetensiDetailPagableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomKompetensiDetailPagableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
