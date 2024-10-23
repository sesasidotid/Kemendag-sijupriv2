import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PakDetailComponent } from './pak-detail.component';

describe('PakDetailComponent', () => {
  let component: PakDetailComponent;
  let fixture: ComponentFixture<PakDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PakDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PakDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
