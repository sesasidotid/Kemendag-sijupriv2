import { TestBed } from '@angular/core/testing';

import { PendingTaskService } from './pending-task.service';

describe('PendingTaskService', () => {
  let service: PendingTaskService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PendingTaskService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
