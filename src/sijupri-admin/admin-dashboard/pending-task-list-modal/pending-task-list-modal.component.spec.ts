import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingTaskListModalComponent } from './pending-task-list-modal.component';

describe('PendingTaskListModalComponent', () => {
  let component: PendingTaskListModalComponent;
  let fixture: ComponentFixture<PendingTaskListModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingTaskListModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PendingTaskListModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
