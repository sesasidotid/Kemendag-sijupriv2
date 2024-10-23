import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KabKotaListComponent } from './kab-kota-list.component';

describe('KabKotaListComponent', () => {
  let component: KabKotaListComponent;
  let fixture: ComponentFixture<KabKotaListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KabKotaListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(KabKotaListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
