import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportUkomCatComponent } from './report-ukom-cat.component';

describe('ReportUkomCatComponent', () => {
  let component: ReportUkomCatComponent;
  let fixture: ComponentFixture<ReportUkomCatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportUkomCatComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportUkomCatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
