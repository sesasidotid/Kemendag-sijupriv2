import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormasiDataRekomendasiDetailComponent } from './formasi-data-rekomendasi-detail.component';

describe('FormasiDataRekomendasiDetailComponent', () => {
  let component: FormasiDataRekomendasiDetailComponent;
  let fixture: ComponentFixture<FormasiDataRekomendasiDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormasiDataRekomendasiDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FormasiDataRekomendasiDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
