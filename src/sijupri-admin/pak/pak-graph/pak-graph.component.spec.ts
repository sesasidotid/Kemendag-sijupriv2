import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PakGraphComponent } from './pak-graph.component';

describe('PakGraphComponent', () => {
  let component: PakGraphComponent;
  let fixture: ComponentFixture<PakGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PakGraphComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PakGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
