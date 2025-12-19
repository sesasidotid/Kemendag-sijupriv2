import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WawancaraComponent } from './wawancara.component';

describe('WawancaraComponent', () => {
  let component: WawancaraComponent;
  let fixture: ComponentFixture<WawancaraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WawancaraComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WawancaraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
