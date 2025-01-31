import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusPendaftaranUkomComponent } from './status-pendaftaran-ukom.component';

describe('StatusPendaftaranUkomComponent', () => {
  let component: StatusPendaftaranUkomComponent;
  let fixture: ComponentFixture<StatusPendaftaranUkomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusPendaftaranUkomComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StatusPendaftaranUkomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
