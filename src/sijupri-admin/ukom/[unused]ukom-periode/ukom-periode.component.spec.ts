import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomPeriodeComponent } from './ukom-periode.component';

describe('UkomPeriodeComponent', () => {
  let component: UkomPeriodeComponent;
  let fixture: ComponentFixture<UkomPeriodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomPeriodeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomPeriodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
