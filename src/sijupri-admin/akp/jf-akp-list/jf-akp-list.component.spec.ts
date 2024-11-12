import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JfAkpListComponent } from './jf-akp-list.component';

describe('JfAkpListComponent', () => {
  let component: JfAkpListComponent;
  let fixture: ComponentFixture<JfAkpListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JfAkpListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(JfAkpListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
