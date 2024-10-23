import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JfTaskListComponent } from './jf-task-list.component';

describe('JfTaskListComponent', () => {
  let component: JfTaskListComponent;
  let fixture: ComponentFixture<JfTaskListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JfTaskListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(JfTaskListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
