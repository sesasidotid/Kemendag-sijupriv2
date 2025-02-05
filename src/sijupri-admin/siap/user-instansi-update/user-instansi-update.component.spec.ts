import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserInstansiUpdateComponent } from './user-instansi-update.component';

describe('UserInstansiUpdateComponent', () => {
  let component: UserInstansiUpdateComponent;
  let fixture: ComponentFixture<UserInstansiUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserInstansiUpdateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserInstansiUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
