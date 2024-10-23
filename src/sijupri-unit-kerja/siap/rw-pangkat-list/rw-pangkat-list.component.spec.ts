import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RwPangkatListComponent } from './rw-pangkat-list.component';

describe('RwPangkatListComponent', () => {
  let component: RwPangkatListComponent;
  let fixture: ComponentFixture<RwPangkatListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RwPangkatListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RwPangkatListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
