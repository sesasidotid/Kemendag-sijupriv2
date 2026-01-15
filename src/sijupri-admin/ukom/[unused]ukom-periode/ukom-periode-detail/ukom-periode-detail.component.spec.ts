import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomPeriodeDetailComponent } from './ukom-periode-detail.component';

describe('UkomPeriodeDetailComponent', () => {
  let component: UkomPeriodeDetailComponent;
  let fixture: ComponentFixture<UkomPeriodeDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomPeriodeDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomPeriodeDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
