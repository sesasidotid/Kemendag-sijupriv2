import { TestBed } from '@angular/core/testing';

import { SuratRekomService } from './surat-rekom.service';

describe('SuratRekomService', () => {
  let service: SuratRekomService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SuratRekomService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
