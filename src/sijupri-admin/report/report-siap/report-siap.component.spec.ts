import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportSiapComponent } from './report-siap.component';

describe('ReportSiapComponent', () => {
  let component: ReportSiapComponent;
  let fixture: ComponentFixture<ReportSiapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportSiapComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportSiapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
