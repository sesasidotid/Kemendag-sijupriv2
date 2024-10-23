import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PakListComponent } from './pak-list.component';

describe('PakListComponent', () => {
  let component: PakListComponent;
  let fixture: ComponentFixture<PakListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PakListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PakListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
