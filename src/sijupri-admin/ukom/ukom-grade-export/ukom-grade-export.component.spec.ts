import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomGradeExportComponent } from './ukom-grade-export.component';

describe('UkomGradeExportComponent', () => {
  let component: UkomGradeExportComponent;
  let fixture: ComponentFixture<UkomGradeExportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomGradeExportComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomGradeExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
