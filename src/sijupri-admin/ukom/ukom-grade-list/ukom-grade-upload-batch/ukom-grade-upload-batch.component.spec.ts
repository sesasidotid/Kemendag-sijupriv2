import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomGradeUploadBatchComponent } from './ukom-grade-upload-batch.component';

describe('UkomGradeUploadBatchComponent', () => {
  let component: UkomGradeUploadBatchComponent;
  let fixture: ComponentFixture<UkomGradeUploadBatchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomGradeUploadBatchComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomGradeUploadBatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
