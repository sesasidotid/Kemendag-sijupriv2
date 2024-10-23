import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomTaskFormComponent } from './ukom-task-form.component';

describe('UkomTaskFormComponent', () => {
  let component: UkomTaskFormComponent;
  let fixture: ComponentFixture<UkomTaskFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomTaskFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomTaskFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
