import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomGradeListComponent } from './ukom-grade-list.component';

describe('UkomGradeListComponent', () => {
  let component: UkomGradeListComponent;
  let fixture: ComponentFixture<UkomGradeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomGradeListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomGradeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
