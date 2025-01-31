import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RejectUkomScheduleComponent } from './reject-ukom-schedule.component';

describe('RejectUkomScheduleComponent', () => {
  let component: RejectUkomScheduleComponent;
  let fixture: ComponentFixture<RejectUkomScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RejectUkomScheduleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RejectUkomScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
