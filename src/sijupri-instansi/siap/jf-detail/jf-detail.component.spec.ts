import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JfDetailComponent } from './jf-detail.component';

describe('JfDetailComponent', () => {
  let component: JfDetailComponent;
  let fixture: ComponentFixture<JfDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JfDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(JfDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
