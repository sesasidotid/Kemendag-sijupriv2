import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportUkomRekapitulasiComponent } from './report-ukom-rekapitulasi.component';

describe('ReportUkomRekapitulasiComponent', () => {
  let component: ReportUkomRekapitulasiComponent;
  let fixture: ComponentFixture<ReportUkomRekapitulasiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportUkomRekapitulasiComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportUkomRekapitulasiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
