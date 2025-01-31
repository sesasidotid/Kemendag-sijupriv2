import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomFormulaListComponent } from './ukom-formula-list.component';

describe('UkomFormulaListComponent', () => {
  let component: UkomFormulaListComponent;
  let fixture: ComponentFixture<UkomFormulaListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomFormulaListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomFormulaListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
