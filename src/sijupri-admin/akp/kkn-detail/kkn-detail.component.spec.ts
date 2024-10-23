import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KknDetailComponent } from './kkn-detail.component';

describe('KknDetailComponent', () => {
  let component: KknDetailComponent;
  let fixture: ComponentFixture<KknDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KknDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(KknDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
