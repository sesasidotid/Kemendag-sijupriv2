import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomGradeDetailTableComponent } from './ukom-grade-detail-table.component';

describe('UkomGradeDetailTableComponent', () => {
  let component: UkomGradeDetailTableComponent;
  let fixture: ComponentFixture<UkomGradeDetailTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomGradeDetailTableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomGradeDetailTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
