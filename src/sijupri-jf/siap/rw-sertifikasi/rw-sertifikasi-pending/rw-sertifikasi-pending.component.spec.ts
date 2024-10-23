import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RwSertifikasiPendingComponent } from './rw-sertifikasi-pending.component';

describe('RwSertifikasiPendingComponent', () => {
  let component: RwSertifikasiPendingComponent;
  let fixture: ComponentFixture<RwSertifikasiPendingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RwSertifikasiPendingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RwSertifikasiPendingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
