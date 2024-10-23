import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KknAddComponent } from './kkn-add.component';

describe('KknAddComponent', () => {
  let component: KknAddComponent;
  let fixture: ComponentFixture<KknAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KknAddComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(KknAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
