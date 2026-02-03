import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormasiTaskProcessComponent } from './formasi-task-process.component';

describe('FormasiTaskProcessComponent', () => {
  let component: FormasiTaskProcessComponent;
  let fixture: ComponentFixture<FormasiTaskProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormasiTaskProcessComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FormasiTaskProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
