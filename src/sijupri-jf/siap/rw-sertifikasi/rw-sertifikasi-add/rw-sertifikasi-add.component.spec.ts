import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RwSertifikasiAddComponent } from './rw-sertifikasi-add.component';

describe('RwSertifikasiAddComponent', () => {
  let component: RwSertifikasiAddComponent;
  let fixture: ComponentFixture<RwSertifikasiAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RwSertifikasiAddComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RwSertifikasiAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
