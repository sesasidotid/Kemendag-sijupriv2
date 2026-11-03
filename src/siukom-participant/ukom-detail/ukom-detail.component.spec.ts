import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomDetailComponent } from './ukom-detail.component';

describe('UkomDetailComponent', () => {
  let component: UkomDetailComponent;
  let fixture: ComponentFixture<UkomDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
