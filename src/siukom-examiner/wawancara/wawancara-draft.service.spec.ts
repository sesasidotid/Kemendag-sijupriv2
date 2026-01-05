import { TestBed } from '@angular/core/testing';

import { WawancaraDraftService } from './wawancara-draft.service';

describe('WawancaraDraftService', () => {
  let service: WawancaraDraftService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WawancaraDraftService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
