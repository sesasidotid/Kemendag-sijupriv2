import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormasiTaskJabatanComponent } from './formasi-task-jabatan.component';

describe('FormasiTaskJabatanComponent', () => {
  let component: FormasiTaskJabatanComponent;
  let fixture: ComponentFixture<FormasiTaskJabatanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormasiTaskJabatanComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FormasiTaskJabatanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
