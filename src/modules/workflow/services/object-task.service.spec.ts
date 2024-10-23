import { TestBed } from '@angular/core/testing';

import { ObjectTaskService } from './object-task.service';

describe('ObjectTaskService', () => {
  let service: ObjectTaskService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ObjectTaskService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
