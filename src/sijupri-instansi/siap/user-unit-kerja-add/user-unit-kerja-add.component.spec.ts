import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserUnitKerjaAddComponent } from './user-unit-kerja-add.component';

describe('UserUnitKerjaAddComponent', () => {
  let component: UserUnitKerjaAddComponent;
  let fixture: ComponentFixture<UserUnitKerjaAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserUnitKerjaAddComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserUnitKerjaAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
