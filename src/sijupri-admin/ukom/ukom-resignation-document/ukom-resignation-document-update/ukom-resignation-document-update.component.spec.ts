import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomResignationDocumentUpdateComponent } from './ukom-resignation-document-update.component';

describe('UkomResignationDocumentUpdateComponent', () => {
  let component: UkomResignationDocumentUpdateComponent;
  let fixture: ComponentFixture<UkomResignationDocumentUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomResignationDocumentUpdateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomResignationDocumentUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
