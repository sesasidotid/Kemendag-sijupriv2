import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomExamPraktikComponent } from './ukom-exam-praktik.component';

describe('UkomExamPraktikComponent', () => {
  let component: UkomExamPraktikComponent;
  let fixture: ComponentFixture<UkomExamPraktikComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomExamPraktikComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomExamPraktikComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
