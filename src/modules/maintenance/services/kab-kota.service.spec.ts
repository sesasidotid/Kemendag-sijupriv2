import { TestBed } from '@angular/core/testing';

import { KabKotaService } from './kab-kota.service';

describe('KabKotaService', () => {
  let service: KabKotaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KabKotaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
