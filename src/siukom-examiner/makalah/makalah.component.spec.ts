import { ComponentFixture, TestBed } from '@angular/core/testing'

import { MakalahComponent } from './makalah.component'

describe('MakalahComponent', () => {
    let component: MakalahComponent
    let fixture: ComponentFixture<MakalahComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MakalahComponent],
        }).compileComponents()

        fixture = TestBed.createComponent(MakalahComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
