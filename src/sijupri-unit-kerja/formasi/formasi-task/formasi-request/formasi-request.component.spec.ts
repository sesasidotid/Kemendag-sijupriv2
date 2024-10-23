import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormasiRequestComponent } from './formasi-request.component';

describe('FormasiRequestComponent', () => {
  let component: FormasiRequestComponent;
  let fixture: ComponentFixture<FormasiRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormasiRequestComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FormasiRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
