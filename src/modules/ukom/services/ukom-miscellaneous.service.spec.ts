import { TestBed } from '@angular/core/testing';

import { UkomMiscellaneousService } from './ukom-miscellaneous.service';

describe('UkomMiscellaneousService', () => {
  let service: UkomMiscellaneousService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UkomMiscellaneousService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
