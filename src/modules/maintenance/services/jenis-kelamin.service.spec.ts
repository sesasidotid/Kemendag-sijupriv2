import { TestBed } from '@angular/core/testing';

import { JenisKelaminService } from './jenis-kelamin.service';

describe('JenisKelaminService', () => {
  let service: JenisKelaminService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JenisKelaminService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
