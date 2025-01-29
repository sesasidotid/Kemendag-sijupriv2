import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NonjfRevisiUkomComponent } from './nonjf-revisi-ukom.component';

describe('NonjfRevisiUkomComponent', () => {
  let component: NonjfRevisiUkomComponent;
  let fixture: ComponentFixture<NonjfRevisiUkomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NonjfRevisiUkomComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NonjfRevisiUkomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
