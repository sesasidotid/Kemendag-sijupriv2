import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SijupriInstansiComponent } from './sijupri-instansi.component';

describe('SijupriInstansiComponent', () => {
  let component: SijupriInstansiComponent;
  let fixture: ComponentFixture<SijupriInstansiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SijupriInstansiComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SijupriInstansiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
