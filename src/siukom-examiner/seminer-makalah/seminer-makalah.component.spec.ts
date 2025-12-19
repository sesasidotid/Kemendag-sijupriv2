import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeminerMakalahComponent } from './seminer-makalah.component';

describe('SeminerMakalahComponent', () => {
  let component: SeminerMakalahComponent;
  let fixture: ComponentFixture<SeminerMakalahComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeminerMakalahComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SeminerMakalahComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
