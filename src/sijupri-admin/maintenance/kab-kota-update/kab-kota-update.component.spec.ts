import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KabKotaUpdateComponent } from './kab-kota-update.component';

describe('KabKotaUpdateComponent', () => {
  let component: KabKotaUpdateComponent;
  let fixture: ComponentFixture<KabKotaUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KabKotaUpdateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(KabKotaUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
