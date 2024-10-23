import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomGradeImportComponent } from './ukom-grade-import.component';

describe('UkomGradeImportComponent', () => {
  let component: UkomGradeImportComponent;
  let fixture: ComponentFixture<UkomGradeImportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomGradeImportComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomGradeImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
