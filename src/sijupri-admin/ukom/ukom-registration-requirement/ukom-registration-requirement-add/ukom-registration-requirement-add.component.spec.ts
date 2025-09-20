import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomRegistrationRequirementAddComponent } from './ukom-registration-requirement-add.component';

describe('UkomRegistrationRequirementAddComponent', () => {
  let component: UkomRegistrationRequirementAddComponent;
  let fixture: ComponentFixture<UkomRegistrationRequirementAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomRegistrationRequirementAddComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomRegistrationRequirementAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
