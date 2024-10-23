import { TestBed } from '@angular/core/testing';

import { PendidikanService } from './pendidikan.service';

describe('PendidikanService', () => {
  let service: PendidikanService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PendidikanService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
