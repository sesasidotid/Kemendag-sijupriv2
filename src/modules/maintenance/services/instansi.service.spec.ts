import { TestBed } from '@angular/core/testing';

import { InstansiService } from './instansi.service';

describe('InstansiService', () => {
  let service: InstansiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InstansiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
