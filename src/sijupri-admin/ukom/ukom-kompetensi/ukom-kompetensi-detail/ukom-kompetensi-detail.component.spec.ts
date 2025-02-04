import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomKompetensiDetailComponent } from './ukom-kompetensi-detail.component';

describe('UkomKompetensiDetailComponent', () => {
  let component: UkomKompetensiDetailComponent;
  let fixture: ComponentFixture<UkomKompetensiDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomKompetensiDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomKompetensiDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
