import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomViewScheduleExamineComponent } from './ukom-view-schedule-examine.component';

describe('UkomViewScheduleExamineComponent', () => {
  let component: UkomViewScheduleExamineComponent;
  let fixture: ComponentFixture<UkomViewScheduleExamineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomViewScheduleExamineComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomViewScheduleExamineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
