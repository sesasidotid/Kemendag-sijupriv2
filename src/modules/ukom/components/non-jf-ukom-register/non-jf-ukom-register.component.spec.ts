import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NonJfUkomRegisterComponent } from './non-jf-ukom-register.component';

describe('NonJfUkomRegisterComponent', () => {
  let component: NonJfUkomRegisterComponent;
  let fixture: ComponentFixture<NonJfUkomRegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NonJfUkomRegisterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NonJfUkomRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
