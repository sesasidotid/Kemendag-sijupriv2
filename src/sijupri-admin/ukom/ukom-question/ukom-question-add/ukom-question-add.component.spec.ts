import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomQuestionAddComponent } from './ukom-question-add.component';

describe('UkomQuestionAddComponent', () => {
  let component: UkomQuestionAddComponent;
  let fixture: ComponentFixture<UkomQuestionAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomQuestionAddComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomQuestionAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
