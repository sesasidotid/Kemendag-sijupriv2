import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AKPTaskComponent } from './akp-task-list.component';

describe('AKPTaskComponent', () => {
  let component: AKPTaskComponent;
  let fixture: ComponentFixture<AKPTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AKPTaskComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AKPTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
