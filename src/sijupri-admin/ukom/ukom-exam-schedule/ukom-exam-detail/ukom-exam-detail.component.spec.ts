import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomExamDetailComponent } from './ukom-exam-detail.component';

describe('UkomExamDetailComponent', () => {
  let component: UkomExamDetailComponent;
  let fixture: ComponentFixture<UkomExamDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomExamDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomExamDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
