import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomTaskComponent } from './ukom-task.component';

describe('UkomTaskComponent', () => {
  let component: UkomTaskComponent;
  let fixture: ComponentFixture<UkomTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomTaskComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
