import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitKerjaAddComponent } from './unit-kerja-add.component';

describe('UnitKerjaAddComponent', () => {
  let component: UnitKerjaAddComponent;
  let fixture: ComponentFixture<UnitKerjaAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnitKerjaAddComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UnitKerjaAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
