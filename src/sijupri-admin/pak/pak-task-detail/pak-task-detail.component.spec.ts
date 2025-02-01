import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PakTaskDetailComponent } from './pak-task-detail.component';

describe('PakTaskDetailComponent', () => {
  let component: PakTaskDetailComponent;
  let fixture: ComponentFixture<PakTaskDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PakTaskDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PakTaskDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
