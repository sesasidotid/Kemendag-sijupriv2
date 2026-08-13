import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomResignationApprovedListComponent } from './ukom-resignation-approved-list.component';

describe('UkomResignationApprovedListComponent', () => {
  let component: UkomResignationApprovedListComponent;
  let fixture: ComponentFixture<UkomResignationApprovedListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomResignationApprovedListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomResignationApprovedListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
