import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JfPendingComponent } from './jf-pending.component';

describe('JfPendingComponent', () => {
  let component: JfPendingComponent;
  let fixture: ComponentFixture<JfPendingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JfPendingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(JfPendingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
