import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomResignationTaskDetailComponent } from './ukom-resignation-task-detail.component';

describe('UkomResignationTaskDetailComponent', () => {
  let component: UkomResignationTaskDetailComponent;
  let fixture: ComponentFixture<UkomResignationTaskDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomResignationTaskDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomResignationTaskDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
