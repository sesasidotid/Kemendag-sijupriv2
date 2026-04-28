import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadStudyCaseFileComponent } from './upload-study-case-file.component';

describe('UploadStudyCaseFileComponent', () => {
  let component: UploadStudyCaseFileComponent;
  let fixture: ComponentFixture<UploadStudyCaseFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadStudyCaseFileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UploadStudyCaseFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
