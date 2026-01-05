import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WawancaraPageComponent } from './wawancara-page.component';

describe('WawancaraPageComponent', () => {
  let component: WawancaraPageComponent;
  let fixture: ComponentFixture<WawancaraPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WawancaraPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WawancaraPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
