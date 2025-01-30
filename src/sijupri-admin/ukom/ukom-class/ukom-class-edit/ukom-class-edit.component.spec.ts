import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomClassEditComponent } from './ukom-class-edit.component';

describe('UkomClassEditComponent', () => {
  let component: UkomClassEditComponent;
  let fixture: ComponentFixture<UkomClassEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomClassEditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomClassEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
