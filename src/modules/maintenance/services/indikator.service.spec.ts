import { TestBed } from '@angular/core/testing';

import { IndikatorService } from './indikator.service';

describe('IndikatorService', () => {
  let service: IndikatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IndikatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
