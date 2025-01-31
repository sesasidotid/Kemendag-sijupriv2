import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomRevisionComponent } from './ukom-revision.component';

describe('UkomRevisionComponent', () => {
  let component: UkomRevisionComponent;
  let fixture: ComponentFixture<UkomRevisionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomRevisionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomRevisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
