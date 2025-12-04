import { TestBed } from '@angular/core/testing';

import { UkomRoomService } from './ukom-room.service';

describe('UkomRoomService', () => {
  let service: UkomRoomService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UkomRoomService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
