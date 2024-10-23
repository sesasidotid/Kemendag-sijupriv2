import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RwKinerjaListComponent } from './rw-kinerja-list.component';

describe('RwKinerjaListComponent', () => {
  let component: RwKinerjaListComponent;
  let fixture: ComponentFixture<RwKinerjaListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RwKinerjaListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RwKinerjaListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
