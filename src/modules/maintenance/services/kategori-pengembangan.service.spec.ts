import { TestBed } from '@angular/core/testing';

import { KategoriPengembanganService } from './kategori-pengembangan.service';

describe('KategoriPengembanganService', () => {
  let service: KategoriPengembanganService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KategoriPengembanganService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
