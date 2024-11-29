import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AkpPelatihanAddComponent } from './akp-pelatihan-add.component';

describe('AkpPelatihanAddComponent', () => {
  let component: AkpPelatihanAddComponent;
  let fixture: ComponentFixture<AkpPelatihanAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AkpPelatihanAddComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AkpPelatihanAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
