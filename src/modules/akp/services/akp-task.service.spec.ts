import { TestBed } from '@angular/core/testing';

import { AkpTaskService } from './akp-task.service';

describe('AkpTaskService', () => {
  let service: AkpTaskService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AkpTaskService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
