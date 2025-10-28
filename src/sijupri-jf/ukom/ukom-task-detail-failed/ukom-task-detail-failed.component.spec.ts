import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomTaskDetailFailedComponent } from './ukom-task-detail-failed.component';

describe('UkomTaskDetailFailedComponent', () => {
  let component: UkomTaskDetailFailedComponent;
  let fixture: ComponentFixture<UkomTaskDetailFailedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomTaskDetailFailedComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomTaskDetailFailedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
