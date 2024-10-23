import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagableComponent } from './pagable.component';

describe('PagableComponent', () => {
  let component: PagableComponent;
  let fixture: ComponentFixture<PagableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PagableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
