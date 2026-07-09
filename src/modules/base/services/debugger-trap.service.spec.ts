import { TestBed } from '@angular/core/testing';

import { DebuggerTrapService } from './debugger-trap.service';

describe('DebuggerTrapService', () => {
  let service: DebuggerTrapService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DebuggerTrapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
