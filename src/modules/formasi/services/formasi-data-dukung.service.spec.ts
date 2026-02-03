import { TestBed } from '@angular/core/testing';

import { FormasiDataDukungService } from './formasi-data-dukung.service';

describe('FormasiDataDukungService', () => {
  let service: FormasiDataDukungService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormasiDataDukungService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
