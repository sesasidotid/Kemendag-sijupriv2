import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomExamScheduleListComponent } from './ukom-exam-schedule-list.component';

describe('UkomExamScheduleListComponent', () => {
  let component: UkomExamScheduleListComponent;
  let fixture: ComponentFixture<UkomExamScheduleListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomExamScheduleListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomExamScheduleListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
