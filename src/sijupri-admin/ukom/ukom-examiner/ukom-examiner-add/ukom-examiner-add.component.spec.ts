import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomExaminerAddComponent } from './ukom-examiner-add.component';

describe('UkomExaminerAddComponent', () => {
  let component: UkomExaminerAddComponent;
  let fixture: ComponentFixture<UkomExaminerAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomExaminerAddComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomExaminerAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
