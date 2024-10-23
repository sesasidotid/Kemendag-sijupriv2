import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RwSertifikasiListComponent } from './rw-sertifikasi-list.component';

describe('RwSertifikasiListComponent', () => {
  let component: RwSertifikasiListComponent;
  let fixture: ComponentFixture<RwSertifikasiListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RwSertifikasiListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RwSertifikasiListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
