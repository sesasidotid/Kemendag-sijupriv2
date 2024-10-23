import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JfComponent } from './jf.component';

describe('JfComponent', () => {
  let component: JfComponent;
  let fixture: ComponentFixture<JfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JfComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(JfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
