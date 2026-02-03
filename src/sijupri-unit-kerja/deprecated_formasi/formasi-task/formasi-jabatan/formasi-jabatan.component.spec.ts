import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormasiJabatanComponent } from './formasi-jabatan.component';

describe('FormasiJabatanComponent', () => {
  let component: FormasiJabatanComponent;
  let fixture: ComponentFixture<FormasiJabatanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormasiJabatanComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FormasiJabatanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
