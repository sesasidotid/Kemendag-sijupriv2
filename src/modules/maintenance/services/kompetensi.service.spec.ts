import { TestBed } from '@angular/core/testing';

import { KompetensiService } from './kompetensi.service';

describe('KompetensiService', () => {
  let service: KompetensiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KompetensiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
