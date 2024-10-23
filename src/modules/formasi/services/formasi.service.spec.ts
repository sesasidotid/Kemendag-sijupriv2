import { TestBed } from '@angular/core/testing';

import { FormasiService } from './formasi.service';

describe('FormasiService', () => {
  let service: FormasiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormasiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
