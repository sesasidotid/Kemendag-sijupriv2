import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RwResignationListComponent } from './rw-resignation-list.component';

describe('RwResignationListComponent', () => {
  let component: RwResignationListComponent;
  let fixture: ComponentFixture<RwResignationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RwResignationListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RwResignationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
