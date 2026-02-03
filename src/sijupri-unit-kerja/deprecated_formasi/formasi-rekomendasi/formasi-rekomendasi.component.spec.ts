import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormasiRekomendasiComponent } from './formasi-rekomendasi.component';

describe('FormasiRekomendasiComponent', () => {
  let component: FormasiRekomendasiComponent;
  let fixture: ComponentFixture<FormasiRekomendasiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormasiRekomendasiComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FormasiRekomendasiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
