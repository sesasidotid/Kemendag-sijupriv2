import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomExamCatComponent } from './ukom-exam-cat.component';

describe('UkomExamCatComponent', () => {
  let component: UkomExamCatComponent;
  let fixture: ComponentFixture<UkomExamCatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomExamCatComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomExamCatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
