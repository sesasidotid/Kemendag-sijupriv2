import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatrixOneTableComponent } from './matrix-one-table.component';

describe('MatrixOneTableComponent', () => {
  let component: MatrixOneTableComponent;
  let fixture: ComponentFixture<MatrixOneTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatrixOneTableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MatrixOneTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
