import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SijupriAdminComponent } from './sijupri-admin.component';

describe('SijupriAdminComponent', () => {
  let component: SijupriAdminComponent;
  let fixture: ComponentFixture<SijupriAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SijupriAdminComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SijupriAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
