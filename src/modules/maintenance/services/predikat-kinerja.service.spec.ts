import { TestBed } from '@angular/core/testing';

import { PredikatKinerjaService } from './predikat-kinerja.service';

describe('PredikatKinerjaService', () => {
  let service: PredikatKinerjaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PredikatKinerjaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
