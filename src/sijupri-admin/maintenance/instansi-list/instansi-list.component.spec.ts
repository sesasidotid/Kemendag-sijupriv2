import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstansiListComponent } from './instansi-list.component';

describe('InstansiListComponent', () => {
  let component: InstansiListComponent;
  let fixture: ComponentFixture<InstansiListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstansiListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InstansiListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
