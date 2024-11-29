import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AkpPelatihanListComponent } from './akp-pelatihan-list.component';

describe('AkpPelatihanListComponent', () => {
  let component: AkpPelatihanListComponent;
  let fixture: ComponentFixture<AkpPelatihanListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AkpPelatihanListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AkpPelatihanListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
