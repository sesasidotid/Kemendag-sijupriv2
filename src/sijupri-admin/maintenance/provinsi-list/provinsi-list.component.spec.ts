import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProvinsiListComponent } from './provinsi-list.component';

describe('ProvinsiListComponent', () => {
  let component: ProvinsiListComponent;
  let fixture: ComponentFixture<ProvinsiListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProvinsiListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProvinsiListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
