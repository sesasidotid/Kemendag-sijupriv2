import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RwJabatanPendingComponent } from './rw-jabatan-pending.component';

describe('RwJabatanPendingComponent', () => {
  let component: RwJabatanPendingComponent;
  let fixture: ComponentFixture<RwJabatanPendingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RwJabatanPendingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RwJabatanPendingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
