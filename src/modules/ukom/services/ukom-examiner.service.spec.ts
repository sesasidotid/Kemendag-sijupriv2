import { TestBed } from '@angular/core/testing';

import { UkomExaminerService } from './ukom-examiner.service';

describe('UkomExaminerService', () => {
  let service: UkomExaminerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UkomExaminerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
