import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomAddComponent } from './ukom-add.component';

describe('UkomAddComponent', () => {
  let component: UkomAddComponent;
  let fixture: ComponentFixture<UkomAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomAddComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
