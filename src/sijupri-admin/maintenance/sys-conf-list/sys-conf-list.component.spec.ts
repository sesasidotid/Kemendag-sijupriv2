import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SysConfListComponent } from './sys-conf-list.component';

describe('SysConfListComponent', () => {
  let component: SysConfListComponent;
  let fixture: ComponentFixture<SysConfListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SysConfListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SysConfListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
