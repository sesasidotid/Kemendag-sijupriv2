import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudiKasusPageComponent } from './studi-kasus-page.component';

describe('StudiKasusPageComponent', () => {
  let component: StudiKasusPageComponent;
  let fixture: ComponentFixture<StudiKasusPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudiKasusPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StudiKasusPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
