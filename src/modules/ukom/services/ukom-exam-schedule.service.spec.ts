import { TestBed } from '@angular/core/testing';

import { UkomExamScheduleService } from './ukom-exam-schedule.service';

describe('UkomExamScheduleService', () => {
  let service: UkomExamScheduleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UkomExamScheduleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
