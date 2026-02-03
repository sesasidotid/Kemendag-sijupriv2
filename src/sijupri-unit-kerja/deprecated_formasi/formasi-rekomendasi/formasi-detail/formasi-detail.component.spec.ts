import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormasiDetailComponent } from './formasi-detail.component';

describe('FormasiDetailComponent', () => {
  let component: FormasiDetailComponent;
  let fixture: ComponentFixture<FormasiDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormasiDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FormasiDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
