import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomResignationUpdateComponent } from './ukom-resignation-update.component';

describe('UkomResignationUpdateComponent', () => {
  let component: UkomResignationUpdateComponent;
  let fixture: ComponentFixture<UkomResignationUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomResignationUpdateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomResignationUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
