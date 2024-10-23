import { TestBed } from '@angular/core/testing';

import { FormasiUnsurService } from './formasi-unsur.service';

describe('FormasiUnsurService', () => {
  let service: FormasiUnsurService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormasiUnsurService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
