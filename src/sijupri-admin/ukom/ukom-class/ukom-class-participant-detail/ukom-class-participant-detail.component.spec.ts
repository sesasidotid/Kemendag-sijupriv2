import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomClassParticipantDetailComponent } from './ukom-class-participant-detail.component';

describe('UkomClassParticipantDetailComponent', () => {
  let component: UkomClassParticipantDetailComponent;
  let fixture: ComponentFixture<UkomClassParticipantDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomClassParticipantDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomClassParticipantDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
