import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormasiDokumenComponent } from './formasi-dokumen.component';

describe('FormasiDokumenComponent', () => {
  let component: FormasiDokumenComponent;
  let fixture: ComponentFixture<FormasiDokumenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormasiDokumenComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FormasiDokumenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
