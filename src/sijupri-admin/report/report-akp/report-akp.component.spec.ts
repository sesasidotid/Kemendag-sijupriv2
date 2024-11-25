import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportAkpComponent } from './report-akp.component';

describe('ReportAkpComponent', () => {
  let component: ReportAkpComponent;
  let fixture: ComponentFixture<ReportAkpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportAkpComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportAkpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
