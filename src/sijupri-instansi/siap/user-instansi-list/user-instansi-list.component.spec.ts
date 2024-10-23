import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserInstansiListComponent } from './user-instansi-list.component';

describe('UserInstansiListComponent', () => {
  let component: UserInstansiListComponent;
  let fixture: ComponentFixture<UserInstansiListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserInstansiListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserInstansiListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
