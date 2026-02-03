import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormasiTaskDetailComponent } from './formasi-task-detail.component';

describe('FormasiTaskDetailComponent', () => {
  let component: FormasiTaskDetailComponent;
  let fixture: ComponentFixture<FormasiTaskDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormasiTaskDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FormasiTaskDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
