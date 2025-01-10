import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RekapTableComponent } from './rekap-table.component';

describe('RekapTableComponent', () => {
  let component: RekapTableComponent;
  let fixture: ComponentFixture<RekapTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RekapTableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RekapTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
