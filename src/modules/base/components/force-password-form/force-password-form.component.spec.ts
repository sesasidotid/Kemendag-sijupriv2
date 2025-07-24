import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForcePasswordFormComponent } from './force-password-form.component';

describe('ForcePasswordFormComponent', () => {
  let component: ForcePasswordFormComponent;
  let fixture: ComponentFixture<ForcePasswordFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForcePasswordFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ForcePasswordFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
