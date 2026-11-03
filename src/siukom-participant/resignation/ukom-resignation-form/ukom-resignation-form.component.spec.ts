import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomResignationFormComponent } from './ukom-resignation-form.component';

describe('UkomResignationFormComponent', () => {
  let component: UkomResignationFormComponent;
  let fixture: ComponentFixture<UkomResignationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomResignationFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomResignationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
