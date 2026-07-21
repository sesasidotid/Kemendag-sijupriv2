import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RwUkomListComponent } from './rw-ukom-list.component';

describe('RwUkomListComponent', () => {
  let component: RwUkomListComponent;
  let fixture: ComponentFixture<RwUkomListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RwUkomListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RwUkomListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
