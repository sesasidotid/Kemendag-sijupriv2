import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitKerjaDetailComponent } from './unit-kerja-detail.component';

describe('UnitKerjaDetailComponent', () => {
  let component: UnitKerjaDetailComponent;
  let fixture: ComponentFixture<UnitKerjaDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnitKerjaDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UnitKerjaDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
