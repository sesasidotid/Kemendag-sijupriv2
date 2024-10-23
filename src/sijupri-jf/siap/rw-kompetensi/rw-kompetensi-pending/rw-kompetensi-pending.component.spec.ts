import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RwKompetensiPendingComponent } from './rw-kompetensi-pending.component';

describe('RwKompetensiPendingComponent', () => {
  let component: RwKompetensiPendingComponent;
  let fixture: ComponentFixture<RwKompetensiPendingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RwKompetensiPendingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RwKompetensiPendingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
