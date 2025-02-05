import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserUnitKerjaUpdateComponent } from './user-unit-kerja-update.component';

describe('UserUnitKerjaUpdateComponent', () => {
  let component: UserUnitKerjaUpdateComponent;
  let fixture: ComponentFixture<UserUnitKerjaUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserUnitKerjaUpdateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserUnitKerjaUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
