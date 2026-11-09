import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomExportResignationComponent } from './ukom-export-resignation.component';

describe('UkomExportResignationComponent', () => {
  let component: UkomExportResignationComponent;
  let fixture: ComponentFixture<UkomExportResignationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomExportResignationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomExportResignationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
