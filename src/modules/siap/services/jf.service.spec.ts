import { TestBed } from '@angular/core/testing';

import { JfService } from './jf.service';

describe('JfService', () => {
  let service: JfService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JfService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
