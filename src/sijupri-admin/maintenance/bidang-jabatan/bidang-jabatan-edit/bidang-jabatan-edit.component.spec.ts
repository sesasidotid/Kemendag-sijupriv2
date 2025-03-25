import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BidangJabatanEditComponent } from './bidang-jabatan-edit.component';

describe('BidangJabatanEditComponent', () => {
  let component: BidangJabatanEditComponent;
  let fixture: ComponentFixture<BidangJabatanEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BidangJabatanEditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BidangJabatanEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
