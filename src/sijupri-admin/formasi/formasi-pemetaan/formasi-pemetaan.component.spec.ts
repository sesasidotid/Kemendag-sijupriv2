import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormasiPemetaanComponent } from './formasi-pemetaan.component';

describe('FormasiPemetaanComponent', () => {
  let component: FormasiPemetaanComponent;
  let fixture: ComponentFixture<FormasiPemetaanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormasiPemetaanComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FormasiPemetaanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
