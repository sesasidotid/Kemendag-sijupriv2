import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomFormulaDetailComponent } from './ukom-formula-detail.component';

describe('UkomFormulaDetailComponent', () => {
  let component: UkomFormulaDetailComponent;
  let fixture: ComponentFixture<UkomFormulaDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomFormulaDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomFormulaDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
