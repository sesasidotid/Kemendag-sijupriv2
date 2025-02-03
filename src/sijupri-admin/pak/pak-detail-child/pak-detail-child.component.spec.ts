import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PakDetailChildComponent } from './pak-detail-child.component';

describe('PakDetailChildComponent', () => {
  let component: PakDetailChildComponent;
  let fixture: ComponentFixture<PakDetailChildComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PakDetailChildComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PakDetailChildComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
