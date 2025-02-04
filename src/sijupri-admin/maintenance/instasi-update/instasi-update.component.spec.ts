import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstasiUpdateComponent } from './instasi-update.component';

describe('InstasiUpdateComponent', () => {
  let component: InstasiUpdateComponent;
  let fixture: ComponentFixture<InstasiUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstasiUpdateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InstasiUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
