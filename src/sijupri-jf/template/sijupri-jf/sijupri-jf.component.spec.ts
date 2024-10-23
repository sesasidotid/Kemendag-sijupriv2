import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SijupriJfComponent } from './sijupri-jf.component';

describe('SijupriJfComponent', () => {
  let component: SijupriJfComponent;
  let fixture: ComponentFixture<SijupriJfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SijupriJfComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SijupriJfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
