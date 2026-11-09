import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomResignationListComponent } from './ukom-resignation-list.component';

describe('UkomResignationListComponent', () => {
  let component: UkomResignationListComponent;
  let fixture: ComponentFixture<UkomResignationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomResignationListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomResignationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
