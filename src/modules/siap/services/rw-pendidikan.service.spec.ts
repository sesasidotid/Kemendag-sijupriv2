import { TestBed } from '@angular/core/testing';

import { RwPendidikanService } from './rw-pendidikan.service';

describe('RwPendidikanService', () => {
  let service: RwPendidikanService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RwPendidikanService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
