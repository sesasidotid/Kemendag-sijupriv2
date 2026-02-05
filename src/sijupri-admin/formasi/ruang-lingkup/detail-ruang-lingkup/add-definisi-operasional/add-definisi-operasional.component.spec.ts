import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDefinisiOperasionalComponent } from './add-definisi-operasional.component';

describe('AddDefinisiOperasionalComponent', () => {
  let component: AddDefinisiOperasionalComponent;
  let fixture: ComponentFixture<AddDefinisiOperasionalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddDefinisiOperasionalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddDefinisiOperasionalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
