import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KknComponent } from './kkn.component';

describe('KknComponent', () => {
  let component: KknComponent;
  let fixture: ComponentFixture<KknComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KknComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(KknComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
