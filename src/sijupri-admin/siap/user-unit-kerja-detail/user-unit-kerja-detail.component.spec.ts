import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserUnitKerjaDetailComponent } from './user-unit-kerja-detail.component';

describe('UserUnitKerjaDetailComponent', () => {
  let component: UserUnitKerjaDetailComponent;
  let fixture: ComponentFixture<UserUnitKerjaDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserUnitKerjaDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserUnitKerjaDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
