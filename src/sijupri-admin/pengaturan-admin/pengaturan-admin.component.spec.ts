import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PengaturanAdminComponent } from './pengaturan-admin.component';

describe('PengaturanAdminComponent', () => {
  let component: PengaturanAdminComponent;
  let fixture: ComponentFixture<PengaturanAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PengaturanAdminComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PengaturanAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
