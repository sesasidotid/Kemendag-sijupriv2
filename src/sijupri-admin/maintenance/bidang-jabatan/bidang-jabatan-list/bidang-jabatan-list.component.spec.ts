import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BidangJabatanListComponent } from './bidang-jabatan-list.component';

describe('BidangJabatanListComponent', () => {
  let component: BidangJabatanListComponent;
  let fixture: ComponentFixture<BidangJabatanListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BidangJabatanListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BidangJabatanListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
