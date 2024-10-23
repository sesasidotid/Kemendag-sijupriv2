import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProvinsiUpdateComponent } from './provinsi-update.component';

describe('ProvinsiUpdateComponent', () => {
  let component: ProvinsiUpdateComponent;
  let fixture: ComponentFixture<ProvinsiUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProvinsiUpdateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProvinsiUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
