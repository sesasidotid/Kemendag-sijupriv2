import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomExamChooseCompQuestionsComponent } from './ukom-exam-choose-comp-questions.component';

describe('UkomExamChooseCompQuestionsComponent', () => {
  let component: UkomExamChooseCompQuestionsComponent;
  let fixture: ComponentFixture<UkomExamChooseCompQuestionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomExamChooseCompQuestionsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomExamChooseCompQuestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
