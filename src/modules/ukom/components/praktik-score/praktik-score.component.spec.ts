import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PraktikScoreComponent } from './praktik-score.component';

describe('PraktikScoreComponent', () => {
  let component: PraktikScoreComponent;
  let fixture: ComponentFixture<PraktikScoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PraktikScoreComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PraktikScoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
