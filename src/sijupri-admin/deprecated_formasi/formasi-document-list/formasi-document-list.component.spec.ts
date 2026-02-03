import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormasiDocumentListComponent } from './formasi-document-list.component';

describe('FormasiDocumentListComponent', () => {
  let component: FormasiDocumentListComponent;
  let fixture: ComponentFixture<FormasiDocumentListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormasiDocumentListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FormasiDocumentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
