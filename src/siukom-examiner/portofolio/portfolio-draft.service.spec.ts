import { TestBed } from '@angular/core/testing';

import { PortfolioDraftService } from './portfolio-draft.service';

describe('PortfolioDraftService', () => {
  let service: PortfolioDraftService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PortfolioDraftService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
