import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomExaminerListComponent } from './ukom-examiner-list.component';

describe('UkomExaminerListComponent', () => {
  let component: UkomExaminerListComponent;
  let fixture: ComponentFixture<UkomExaminerListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomExaminerListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomExaminerListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
