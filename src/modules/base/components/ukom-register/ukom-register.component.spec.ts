import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomRegisterComponent } from './ukom-register.component';

describe('UkomRegisterComponent', () => {
  let component: UkomRegisterComponent;
  let fixture: ComponentFixture<UkomRegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomRegisterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
