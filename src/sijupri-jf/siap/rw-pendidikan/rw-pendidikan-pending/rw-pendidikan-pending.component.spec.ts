import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RwPendidikanPendingComponent } from './rw-pendidikan-pending.component';

describe('RwPendidikanPendingComponent', () => {
  let component: RwPendidikanPendingComponent;
  let fixture: ComponentFixture<RwPendidikanPendingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RwPendidikanPendingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RwPendidikanPendingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
