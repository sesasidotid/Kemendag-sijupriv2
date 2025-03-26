import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomRejectedListComponent } from './ukom-rejected-list.component';

describe('UkomRejectedListComponent', () => {
  let component: UkomRejectedListComponent;
  let fixture: ComponentFixture<UkomRejectedListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomRejectedListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomRejectedListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
