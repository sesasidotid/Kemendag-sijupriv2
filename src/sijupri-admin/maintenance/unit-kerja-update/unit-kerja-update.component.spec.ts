import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitKerjaUpdateComponent } from './unit-kerja-update.component';

describe('UnitKerjaUpdateComponent', () => {
  let component: UnitKerjaUpdateComponent;
  let fixture: ComponentFixture<UnitKerjaUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnitKerjaUpdateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UnitKerjaUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
