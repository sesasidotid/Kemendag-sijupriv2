import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomQuestionListComponent } from './ukom-question-list.component';

describe('UkomQuestionListComponent', () => {
  let component: UkomQuestionListComponent;
  let fixture: ComponentFixture<UkomQuestionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomQuestionListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomQuestionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
