import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BidangJabatanAddComponent } from './bidang-jabatan-add.component';

describe('BidangJabatanAddComponent', () => {
  let component: BidangJabatanAddComponent;
  let fixture: ComponentFixture<BidangJabatanAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BidangJabatanAddComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BidangJabatanAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
