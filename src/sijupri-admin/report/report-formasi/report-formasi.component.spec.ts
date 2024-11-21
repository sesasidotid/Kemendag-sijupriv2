import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportFormasiComponent } from './report-formasi.component';

describe('ReportFormasiComponent', () => {
  let component: ReportFormasiComponent;
  let fixture: ComponentFixture<ReportFormasiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportFormasiComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportFormasiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
