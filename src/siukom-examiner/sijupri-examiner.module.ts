import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { routes } from './sijupri-examiner.routes'

@NgModule({
    declarations: [],
    imports: [CommonModule, RouterModule.forChild(routes)],
})
export class SijupriExaminerModule {}
