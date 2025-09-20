import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomRegistrationRequirementUpdateComponent } from './ukom-registration-requirement-update.component';

describe('UkomRegistrationRequirementUpdateComponent', () => {
  let component: UkomRegistrationRequirementUpdateComponent;
  let fixture: ComponentFixture<UkomRegistrationRequirementUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomRegistrationRequirementUpdateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomRegistrationRequirementUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
