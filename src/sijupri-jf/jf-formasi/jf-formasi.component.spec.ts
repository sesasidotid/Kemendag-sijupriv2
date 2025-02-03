import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JfFormasiComponent } from './jf-formasi.component';

describe('JfFormasiComponent', () => {
  let component: JfFormasiComponent;
  let fixture: ComponentFixture<JfFormasiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JfFormasiComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(JfFormasiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
