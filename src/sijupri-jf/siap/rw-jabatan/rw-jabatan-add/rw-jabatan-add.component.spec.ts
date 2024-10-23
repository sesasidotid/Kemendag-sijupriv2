import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RwJabatanAddComponent } from './rw-jabatan-add.component';

describe('RwJabatanAddComponent', () => {
  let component: RwJabatanAddComponent;
  let fixture: ComponentFixture<RwJabatanAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RwJabatanAddComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RwJabatanAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
