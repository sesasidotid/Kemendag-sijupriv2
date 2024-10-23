import { TestBed } from '@angular/core/testing';

import { JenjangService } from './jenjang.service';

describe('JenjangService', () => {
  let service: JenjangService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JenjangService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
