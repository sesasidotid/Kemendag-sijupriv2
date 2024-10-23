import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserInstansiAddComponent } from './user-instansi-add.component';

describe('UserInstansiAddComponent', () => {
  let component: UserInstansiAddComponent;
  let fixture: ComponentFixture<UserInstansiAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserInstansiAddComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserInstansiAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
