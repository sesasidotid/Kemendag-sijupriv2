import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RwPendidikanAddComponent } from './rw-pendidikan-add.component';

describe('RwPendidikanAddComponent', () => {
  let component: RwPendidikanAddComponent;
  let fixture: ComponentFixture<RwPendidikanAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RwPendidikanAddComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RwPendidikanAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
