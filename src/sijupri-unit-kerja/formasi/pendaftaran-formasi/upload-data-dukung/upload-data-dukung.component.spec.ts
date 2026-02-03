import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadDataDukungComponent } from './upload-data-dukung.component';

describe('UploadDataDukungComponent', () => {
  let component: UploadDataDukungComponent;
  let fixture: ComponentFixture<UploadDataDukungComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadDataDukungComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UploadDataDukungComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
