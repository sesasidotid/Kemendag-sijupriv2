import { TestBed } from '@angular/core/testing';

import { InstansiTypeService } from './instansi-type.service';

describe('InstansiTypeService', () => {
  let service: InstansiTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InstansiTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
