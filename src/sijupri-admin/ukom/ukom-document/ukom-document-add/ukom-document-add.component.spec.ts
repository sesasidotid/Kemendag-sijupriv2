import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomDocumentAddComponent } from './ukom-document-add.component';

describe('UkomDocumentAddComponent', () => {
  let component: UkomDocumentAddComponent;
  let fixture: ComponentFixture<UkomDocumentAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomDocumentAddComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomDocumentAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
