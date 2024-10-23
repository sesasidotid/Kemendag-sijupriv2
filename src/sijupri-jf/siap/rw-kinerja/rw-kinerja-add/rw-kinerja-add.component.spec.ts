import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RwKinerjaAddComponent } from './rw-kinerja-add.component';

describe('RwKinerjaAddComponent', () => {
  let component: RwKinerjaAddComponent;
  let fixture: ComponentFixture<RwKinerjaAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RwKinerjaAddComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RwKinerjaAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
