import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormasiTaskComponent } from './formasi-task.component';

describe('FormasiTaskComponent', () => {
  let component: FormasiTaskComponent;
  let fixture: ComponentFixture<FormasiTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormasiTaskComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FormasiTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
