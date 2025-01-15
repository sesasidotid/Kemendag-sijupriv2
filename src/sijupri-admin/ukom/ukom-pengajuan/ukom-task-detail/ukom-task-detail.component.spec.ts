import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomTaskDetailComponent } from './ukom-task-detail.component';

describe('UkomTaskDetailComponent', () => {
  let component: UkomTaskDetailComponent;
  let fixture: ComponentFixture<UkomTaskDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomTaskDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomTaskDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
