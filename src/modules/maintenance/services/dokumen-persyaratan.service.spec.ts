import { TestBed } from '@angular/core/testing';

import { DokumenPersyaratanService } from './dokumen-persyaratan.service';

describe('DokumenPersyaratanService', () => {
  let service: DokumenPersyaratanService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DokumenPersyaratanService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
