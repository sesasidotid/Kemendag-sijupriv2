import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomResignationDocumentAddComponent } from './ukom-resignation-document-add.component';

describe('UkomResignationDocumentAddComponent', () => {
  let component: UkomResignationDocumentAddComponent;
  let fixture: ComponentFixture<UkomResignationDocumentAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomResignationDocumentAddComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomResignationDocumentAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
