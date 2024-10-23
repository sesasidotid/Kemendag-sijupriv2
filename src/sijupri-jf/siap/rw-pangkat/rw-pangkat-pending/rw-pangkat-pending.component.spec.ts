import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RwPangkatPendingComponent } from './rw-pangkat-pending.component';

describe('RwPangkatPendingComponent', () => {
  let component: RwPangkatPendingComponent;
  let fixture: ComponentFixture<RwPangkatPendingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RwPangkatPendingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RwPangkatPendingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
