import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RuangLingkupComponent } from './ruang-lingkup.component';

describe('RuangLingkupComponent', () => {
  let component: RuangLingkupComponent;
  let fixture: ComponentFixture<RuangLingkupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RuangLingkupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RuangLingkupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
