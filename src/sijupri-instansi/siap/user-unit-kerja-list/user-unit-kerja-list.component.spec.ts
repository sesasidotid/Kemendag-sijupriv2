import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserUnitKerjaListComponent } from './user-unit-kerja-list.component';

describe('UserUnitKerjaListComponent', () => {
  let component: UserUnitKerjaListComponent;
  let fixture: ComponentFixture<UserUnitKerjaListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserUnitKerjaListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserUnitKerjaListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
