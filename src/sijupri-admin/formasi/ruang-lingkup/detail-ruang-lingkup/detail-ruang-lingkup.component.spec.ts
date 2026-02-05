import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailRuangLingkupComponent } from './detail-ruang-lingkup.component';

describe('DetailRuangLingkupComponent', () => {
  let component: DetailRuangLingkupComponent;
  let fixture: ComponentFixture<DetailRuangLingkupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailRuangLingkupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DetailRuangLingkupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
