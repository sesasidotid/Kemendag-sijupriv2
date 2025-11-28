import { TestBed } from '@angular/core/testing';

import { UkomModulesService } from './ukom-modules.service';

describe('UkomModulesService', () => {
  let service: UkomModulesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UkomModulesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
