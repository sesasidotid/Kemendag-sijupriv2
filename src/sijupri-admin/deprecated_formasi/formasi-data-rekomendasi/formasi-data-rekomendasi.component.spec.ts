import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormasiDataRekomendasiComponent } from './formasi-data-rekomendasi.component';

describe('FormasiDataRekomendasiComponent', () => {
  let component: FormasiDataRekomendasiComponent;
  let fixture: ComponentFixture<FormasiDataRekomendasiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormasiDataRekomendasiComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FormasiDataRekomendasiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
