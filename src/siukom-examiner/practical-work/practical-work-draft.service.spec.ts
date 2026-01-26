import { TestBed } from '@angular/core/testing';

import { PracticalWorkDraftService } from './practical-work-draft.service';

describe('PracticalWorkDraftService', () => {
  let service: PracticalWorkDraftService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PracticalWorkDraftService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
