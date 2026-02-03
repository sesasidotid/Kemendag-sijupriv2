import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormasiTaskListComponent } from './formasi-task-list.component';

describe('FormasiTaskListComponent', () => {
  let component: FormasiTaskListComponent;
  let fixture: ComponentFixture<FormasiTaskListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormasiTaskListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FormasiTaskListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
