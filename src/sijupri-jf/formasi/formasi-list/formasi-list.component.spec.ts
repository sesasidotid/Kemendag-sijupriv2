import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormasiListComponent } from './formasi-list.component';

describe('FormasiListComponent', () => {
  let component: FormasiListComponent;
  let fixture: ComponentFixture<FormasiListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormasiListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FormasiListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
