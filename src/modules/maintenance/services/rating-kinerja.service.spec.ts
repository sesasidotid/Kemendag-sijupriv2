import { TestBed } from '@angular/core/testing';

import { RatingKinerjaService } from './rating-kinerja.service';

describe('RatingKinerjaService', () => {
  let service: RatingKinerjaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RatingKinerjaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
