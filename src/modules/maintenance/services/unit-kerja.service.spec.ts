import { TestBed } from '@angular/core/testing';

import { UnitKerjaService } from './unit-kerja.service';

describe('UnitKerjaService', () => {
  let service: UnitKerjaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UnitKerjaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
