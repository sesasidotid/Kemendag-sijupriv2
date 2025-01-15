import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomTaskListComponent } from './ukom-task-list.component';

describe('UkomTaskListComponent', () => {
  let component: UkomTaskListComponent;
  let fixture: ComponentFixture<UkomTaskListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomTaskListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomTaskListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
