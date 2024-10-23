import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KabKotaAddComponent } from './kab-kota-add.component';

describe('KabKotaAddComponent', () => {
  let component: KabKotaAddComponent;
  let fixture: ComponentFixture<KabKotaAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KabKotaAddComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(KabKotaAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
