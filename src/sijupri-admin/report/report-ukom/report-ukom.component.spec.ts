import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportUkomComponent } from './report-ukom.component';

describe('ReportUkomComponent', () => {
  let component: ReportUkomComponent;
  let fixture: ComponentFixture<ReportUkomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportUkomComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportUkomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
