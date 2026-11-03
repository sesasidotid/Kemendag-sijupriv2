import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomResignationDocumentListComponent } from './ukom-resignation-document-list.component';

describe('UkomResignationDocumentListComponent', () => {
  let component: UkomResignationDocumentListComponent;
  let fixture: ComponentFixture<UkomResignationDocumentListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomResignationDocumentListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomResignationDocumentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
