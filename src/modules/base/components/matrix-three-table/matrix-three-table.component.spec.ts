import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatrixThreeTableComponent } from './matrix-three-table.component';

describe('MatrixThreeTableComponent', () => {
  let component: MatrixThreeTableComponent;
  let fixture: ComponentFixture<MatrixThreeTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatrixThreeTableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MatrixThreeTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
