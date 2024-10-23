import { TestBed } from '@angular/core/testing';

import { PendingFormasiService } from './pending-formasi.service';

describe('PendingFormasiService', () => {
  let service: PendingFormasiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PendingFormasiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
