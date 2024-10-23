import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AkpGradingComponent } from './akp-grading.component';

describe('AkpGradingComponent', () => {
  let component: AkpGradingComponent;
  let fixture: ComponentFixture<AkpGradingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AkpGradingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AkpGradingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
