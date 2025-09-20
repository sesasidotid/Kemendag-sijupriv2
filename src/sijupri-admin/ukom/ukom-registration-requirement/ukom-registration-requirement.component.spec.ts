import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomRegistrationRequirementComponent } from './ukom-registration-requirement.component';

describe('UkomRegistrationRequirementComponent', () => {
  let component: UkomRegistrationRequirementComponent;
  let fixture: ComponentFixture<UkomRegistrationRequirementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomRegistrationRequirementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomRegistrationRequirementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
