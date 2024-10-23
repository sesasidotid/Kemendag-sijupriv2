import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RwKinerjaPendingComponent } from './rw-kinerja-pending.component';

describe('RwKinerjaPendingComponent', () => {
  let component: RwKinerjaPendingComponent;
  let fixture: ComponentFixture<RwKinerjaPendingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RwKinerjaPendingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RwKinerjaPendingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
