import { TestBed } from '@angular/core/testing';

import { PangkatService } from './pangkat.service';

describe('PangkatService', () => {
  let service: PangkatService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PangkatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
