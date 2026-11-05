import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomImportGradeComponent } from './ukom-import-grade.component';

describe('UkomImportGradeComponent', () => {
  let component: UkomImportGradeComponent;
  let fixture: ComponentFixture<UkomImportGradeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomImportGradeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomImportGradeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
