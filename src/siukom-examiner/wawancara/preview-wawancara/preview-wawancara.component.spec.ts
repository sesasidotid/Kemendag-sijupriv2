import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewWawancaraComponent } from './preview-wawancara.component';

describe('PreviewWawancaraComponent', () => {
  let component: PreviewWawancaraComponent;
  let fixture: ComponentFixture<PreviewWawancaraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreviewWawancaraComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PreviewWawancaraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
