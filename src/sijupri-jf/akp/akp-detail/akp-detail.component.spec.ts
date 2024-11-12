import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AkpDetailComponent } from './akp-detail.component';

describe('AkpDetailComponent', () => {
  let component: AkpDetailComponent;
  let fixture: ComponentFixture<AkpDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AkpDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AkpDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
