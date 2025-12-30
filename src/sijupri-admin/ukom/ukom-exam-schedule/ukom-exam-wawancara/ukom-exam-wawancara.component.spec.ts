import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomExamWawancaraComponent } from './ukom-exam-wawancara.component';

describe('UkomExamWawancaraComponent', () => {
  let component: UkomExamWawancaraComponent;
  let fixture: ComponentFixture<UkomExamWawancaraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomExamWawancaraComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomExamWawancaraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
