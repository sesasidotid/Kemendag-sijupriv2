import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomListComponent } from './ukom-list.component';

describe('UkomListComponent', () => {
  let component: UkomListComponent;
  let fixture: ComponentFixture<UkomListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
