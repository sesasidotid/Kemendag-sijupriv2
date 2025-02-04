import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstasiDetailComponent } from './instasi-detail.component';

describe('InstasiDetailComponent', () => {
  let component: InstasiDetailComponent;
  let fixture: ComponentFixture<InstasiDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstasiDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InstasiDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
