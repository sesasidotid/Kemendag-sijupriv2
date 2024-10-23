import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitKerjaListComponent } from './unit-kerja-list.component';

describe('UnitKerjaListComponent', () => {
  let component: UnitKerjaListComponent;
  let fixture: ComponentFixture<UnitKerjaListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnitKerjaListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UnitKerjaListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
