import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserInstasiDetailComponent } from './user-instasi-detail.component';

describe('UserInstasiDetailComponent', () => {
  let component: UserInstasiDetailComponent;
  let fixture: ComponentFixture<UserInstasiDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserInstasiDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserInstasiDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
