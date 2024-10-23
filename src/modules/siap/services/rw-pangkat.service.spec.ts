import { TestBed } from '@angular/core/testing';

import { RwPangkatService } from './rw-pangkat.service';

describe('RwPangkatService', () => {
  let service: RwPangkatService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RwPangkatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
