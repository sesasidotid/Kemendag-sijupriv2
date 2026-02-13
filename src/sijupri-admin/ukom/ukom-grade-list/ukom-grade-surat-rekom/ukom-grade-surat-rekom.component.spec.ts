import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomGradeSuratRekomComponent } from './ukom-grade-surat-rekom.component';

describe('UkomGradeSuratRekomComponent', () => {
  let component: UkomGradeSuratRekomComponent;
  let fixture: ComponentFixture<UkomGradeSuratRekomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomGradeSuratRekomComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomGradeSuratRekomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
