import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UkomKompetensiListComponent } from './ukom-kompetensi-list.component';

describe('UkomKompetensiListComponent', () => {
  let component: UkomKompetensiListComponent;
  let fixture: ComponentFixture<UkomKompetensiListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomKompetensiListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UkomKompetensiListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
