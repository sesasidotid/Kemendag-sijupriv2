import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatrixTwoTableComponent } from './matrix-two-table.component';

describe('MatrixTwoTableComponent', () => {
  let component: MatrixTwoTableComponent;
  let fixture: ComponentFixture<MatrixTwoTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatrixTwoTableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MatrixTwoTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
