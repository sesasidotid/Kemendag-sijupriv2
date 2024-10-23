import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RwJabatanListComponent } from './rw-jabatan-list.component';

describe('RwJabatanListComponent', () => {
  let component: RwJabatanListComponent;
  let fixture: ComponentFixture<RwJabatanListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RwJabatanListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RwJabatanListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
