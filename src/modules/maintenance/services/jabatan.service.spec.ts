import { TestBed } from '@angular/core/testing';

import { JabatanService } from './jabatan.service';

describe('JabatanService', () => {
  let service: JabatanService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JabatanService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
