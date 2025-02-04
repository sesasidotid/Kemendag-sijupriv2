import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KabKotaDetailComponent } from './kab-kota-detail.component';

describe('KabKotaDetailComponent', () => {
  let component: KabKotaDetailComponent;
  let fixture: ComponentFixture<KabKotaDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KabKotaDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(KabKotaDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
