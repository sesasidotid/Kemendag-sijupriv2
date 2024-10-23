import { TestBed } from '@angular/core/testing';

import { UserUnitKerjaService } from './user-unit-kerja.service';

describe('UserUnitKerjaService', () => {
  let service: UserUnitKerjaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserUnitKerjaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
