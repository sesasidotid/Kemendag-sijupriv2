import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MakalahPageComponent } from './makalah-page.component';

describe('MakalahPageComponent', () => {
  let component: MakalahPageComponent;
  let fixture: ComponentFixture<MakalahPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MakalahPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MakalahPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
