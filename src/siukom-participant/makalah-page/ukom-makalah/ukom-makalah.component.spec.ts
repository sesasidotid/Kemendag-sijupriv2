import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomMakalahComponent } from './ukom-makalah.component';

describe('UkomMakalahComponent', () => {
  let component: UkomMakalahComponent;
  let fixture: ComponentFixture<UkomMakalahComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomMakalahComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomMakalahComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
