import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomClassDetailComponent } from './ukom-class-detail.component';

describe('UkomClassDetailComponent', () => {
  let component: UkomClassDetailComponent;
  let fixture: ComponentFixture<UkomClassDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomClassDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomClassDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
