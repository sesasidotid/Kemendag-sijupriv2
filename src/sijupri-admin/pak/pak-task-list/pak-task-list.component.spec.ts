import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PakTaskListComponent } from './pak-task-list.component';

describe('PakTaskListComponent', () => {
  let component: PakTaskListComponent;
  let fixture: ComponentFixture<PakTaskListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PakTaskListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PakTaskListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
