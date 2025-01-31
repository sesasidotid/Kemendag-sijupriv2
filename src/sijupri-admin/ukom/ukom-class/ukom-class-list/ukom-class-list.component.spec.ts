import { ComponentFixture, TestBed } from '@angular/core/testing'

import { UkomClassListComponent } from './ukom-class-list.component'

describe('UkomClassListComponent', () => {
  let component: UkomClassListComponent
  let fixture: ComponentFixture<UkomClassListComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkomClassListComponent]
    }).compileComponents()

    fixture = TestBed.createComponent(UkomClassListComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
