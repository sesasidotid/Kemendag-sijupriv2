import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataDukungComponent } from './data-dukung.component';

describe('DataDukungComponent', () => {
  let component: DataDukungComponent;
  let fixture: ComponentFixture<DataDukungComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataDukungComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DataDukungComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
