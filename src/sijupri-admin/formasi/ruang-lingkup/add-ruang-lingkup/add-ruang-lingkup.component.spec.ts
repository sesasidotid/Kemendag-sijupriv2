import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRuangLingkupComponent } from './add-ruang-lingkup.component';

describe('AddRuangLingkupComponent', () => {
  let component: AddRuangLingkupComponent;
  let fixture: ComponentFixture<AddRuangLingkupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddRuangLingkupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddRuangLingkupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
