import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JfTaskDetailComponent } from './jf-task-detail.component';

describe('JfTaskDetailComponent', () => {
  let component: JfTaskDetailComponent;
  let fixture: ComponentFixture<JfTaskDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JfTaskDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(JfTaskDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
