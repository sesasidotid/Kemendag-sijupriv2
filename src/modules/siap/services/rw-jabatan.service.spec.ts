import { TestBed } from '@angular/core/testing';

import { RwJabatanService } from './rw-jabatan.service';

describe('RwJabatanService', () => {
  let service: RwJabatanService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RwJabatanService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
