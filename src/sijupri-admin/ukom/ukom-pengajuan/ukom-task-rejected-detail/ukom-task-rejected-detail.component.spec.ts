import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomTaskRejectedDetailComponent } from './ukom-task-rejected-detail.component';

describe('UkomTaskRejectedDetailComponent', () => {
  let component: UkomTaskRejectedDetailComponent;
  let fixture: ComponentFixture<UkomTaskRejectedDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomTaskRejectedDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomTaskRejectedDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
