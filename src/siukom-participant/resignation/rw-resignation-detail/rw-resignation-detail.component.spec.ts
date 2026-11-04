import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RwResignationDetailComponent } from './rw-resignation-detail.component';

describe('RwResignationDetailComponent', () => {
  let component: RwResignationDetailComponent;
  let fixture: ComponentFixture<RwResignationDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RwResignationDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RwResignationDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
