import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JfAddComponent } from './jf-add.component';

describe('JfAddComponent', () => {
  let component: JfAddComponent;
  let fixture: ComponentFixture<JfAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JfAddComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(JfAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
