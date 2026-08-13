import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomResignationDetailComponent } from './ukom-resignation-detail.component';

describe('UkomResignationDetailComponent', () => {
  let component: UkomResignationDetailComponent;
  let fixture: ComponentFixture<UkomResignationDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomResignationDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomResignationDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
