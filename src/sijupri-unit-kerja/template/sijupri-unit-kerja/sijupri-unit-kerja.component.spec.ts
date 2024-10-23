import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SijupriUnitKerjaComponent } from './sijupri-unit-kerja.component';

describe('SijupriUnitKerjaComponent', () => {
  let component: SijupriUnitKerjaComponent;
  let fixture: ComponentFixture<SijupriUnitKerjaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SijupriUnitKerjaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SijupriUnitKerjaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
