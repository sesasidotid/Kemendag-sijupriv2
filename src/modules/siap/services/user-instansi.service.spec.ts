import { TestBed } from '@angular/core/testing';

import { UserInstansiService } from './user-instansi.service';

describe('UserInstansiService', () => {
  let service: UserInstansiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserInstansiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
