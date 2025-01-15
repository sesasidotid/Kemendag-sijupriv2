import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomClassAddComponent } from './ukom-class-add.component';

describe('UkomClassAddComponent', () => {
  let component: UkomClassAddComponent;
  let fixture: ComponentFixture<UkomClassAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomClassAddComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomClassAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
