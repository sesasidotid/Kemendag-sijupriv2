import { TestBed } from '@angular/core/testing';

import { RwSertifikasiService } from './rw-sertifikasi.service';

describe('RwSertifikasiService', () => {
  let service: RwSertifikasiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RwSertifikasiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
