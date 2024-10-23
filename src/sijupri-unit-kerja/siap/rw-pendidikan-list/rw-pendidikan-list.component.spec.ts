import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RwPendidikanListComponent } from './rw-pendidikan-list.component';

describe('RwPendidikanListComponent', () => {
  let component: RwPendidikanListComponent;
  let fixture: ComponentFixture<RwPendidikanListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RwPendidikanListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RwPendidikanListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
