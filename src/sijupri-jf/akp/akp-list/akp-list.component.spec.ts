import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AkpListComponent } from './akp-list.component';

describe('AkpListComponent', () => {
  let component: AkpListComponent;
  let fixture: ComponentFixture<AkpListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AkpListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AkpListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
