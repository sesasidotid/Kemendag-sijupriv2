import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomDocumentListComponent } from './ukom-document-list.component';

describe('UkomDocumentListComponent', () => {
  let component: UkomDocumentListComponent;
  let fixture: ComponentFixture<UkomDocumentListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomDocumentListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomDocumentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
