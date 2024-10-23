import { TestBed } from '@angular/core/testing';

import { KategoriSertifikasiService } from './kategori-sertifikasi.service';

describe('KategoriSertifikasiService', () => {
  let service: KategoriSertifikasiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KategoriSertifikasiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
