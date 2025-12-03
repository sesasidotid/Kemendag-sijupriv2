import { TestBed } from '@angular/core/testing';

import { ExamGradeService } from './exam-grade.service';

describe('ExamGradeService', () => {
  let service: ExamGradeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExamGradeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
