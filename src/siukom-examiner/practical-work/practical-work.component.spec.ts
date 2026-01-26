import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PracticalWorkComponent } from './practical-work.component';

describe('PracticalWorkComponent', () => {
  let component: PracticalWorkComponent;
  let fixture: ComponentFixture<PracticalWorkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PracticalWorkComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PracticalWorkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
