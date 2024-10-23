import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProvinsiAddComponent } from './provinsi-add.component';

describe('ProvinsiAddComponent', () => {
  let component: ProvinsiAddComponent;
  let fixture: ComponentFixture<ProvinsiAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProvinsiAddComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProvinsiAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
