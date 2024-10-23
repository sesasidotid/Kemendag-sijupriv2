import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JfListComponent } from './jf-list.component';

describe('JfListComponent', () => {
  let component: JfListComponent;
  let fixture: ComponentFixture<JfListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JfListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(JfListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
