import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomExamMakalahComponent } from './ukom-exam-makalah.component';

describe('UkomExamMakalahComponent', () => {
  let component: UkomExamMakalahComponent;
  let fixture: ComponentFixture<UkomExamMakalahComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomExamMakalahComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomExamMakalahComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
