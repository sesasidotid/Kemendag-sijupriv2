import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProvinsiDetailComponent } from './provinsi-detail.component';

describe('ProvinsiDetailComponent', () => {
  let component: ProvinsiDetailComponent;
  let fixture: ComponentFixture<ProvinsiDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProvinsiDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProvinsiDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
