import { TestBed } from '@angular/core/testing';

import { RwKinerjaService } from './rw-kinerja.service';

describe('RwKinerjaService', () => {
  let service: RwKinerjaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RwKinerjaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
