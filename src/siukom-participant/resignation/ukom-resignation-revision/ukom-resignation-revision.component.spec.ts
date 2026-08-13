import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomResignationRevisionComponent } from './ukom-resignation-revision.component';

describe('UkomResignationRevisionComponent', () => {
  let component: UkomResignationRevisionComponent;
  let fixture: ComponentFixture<UkomResignationRevisionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomResignationRevisionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomResignationRevisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
