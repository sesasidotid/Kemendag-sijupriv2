import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstasiAddComponent } from './instasi-add.component';

describe('InstasiAddComponent', () => {
  let component: InstasiAddComponent;
  let fixture: ComponentFixture<InstasiAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstasiAddComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InstasiAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
