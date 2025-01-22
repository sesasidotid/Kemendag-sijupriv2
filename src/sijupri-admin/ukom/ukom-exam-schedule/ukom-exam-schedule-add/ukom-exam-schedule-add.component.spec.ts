import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomExamScheduleAddComponent } from './ukom-exam-schedule-add.component';

describe('UkomExamScheduleAddComponent', () => {
  let component: UkomExamScheduleAddComponent;
  let fixture: ComponentFixture<UkomExamScheduleAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomExamScheduleAddComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomExamScheduleAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
