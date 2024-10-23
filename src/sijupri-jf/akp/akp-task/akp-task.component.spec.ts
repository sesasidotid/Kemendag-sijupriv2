import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AkpTaskComponent } from './akp-task.component';

describe('AkpTaskComponent', () => {
  let component: AkpTaskComponent;
  let fixture: ComponentFixture<AkpTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AkpTaskComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AkpTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
