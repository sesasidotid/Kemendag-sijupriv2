import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RwPangkatAddComponent } from './rw-pangkat-add.component';

describe('RwPangkatAddComponent', () => {
  let component: RwPangkatAddComponent;
  let fixture: ComponentFixture<RwPangkatAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RwPangkatAddComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RwPangkatAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
