import { TestBed } from '@angular/core/testing';

import { RwKompetensiService } from './rw-kompetensi.service';

describe('RwKompetensiService', () => {
  let service: RwKompetensiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RwKompetensiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
