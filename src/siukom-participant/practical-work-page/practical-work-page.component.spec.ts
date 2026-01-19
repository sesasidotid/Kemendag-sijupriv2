import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PracticalWorkPageComponent } from './practical-work-page.component';

describe('PracticalWorkPageComponent', () => {
  let component: PracticalWorkPageComponent;
  let fixture: ComponentFixture<PracticalWorkPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PracticalWorkPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PracticalWorkPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
