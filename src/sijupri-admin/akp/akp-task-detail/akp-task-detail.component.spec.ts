import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AkpTaskDetailComponent } from './akp-task-detail.component';

describe('AkpTaskDetailComponent', () => {
  let component: AkpTaskDetailComponent;
  let fixture: ComponentFixture<AkpTaskDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AkpTaskDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AkpTaskDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
