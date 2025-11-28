import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomQuestionImportComponent } from './ukom-question-import.component';

describe('UkomQuestionImportComponent', () => {
  let component: UkomQuestionImportComponent;
  let fixture: ComponentFixture<UkomQuestionImportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomQuestionImportComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomQuestionImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
