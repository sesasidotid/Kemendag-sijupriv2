import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { routes } from './sijupri-admin.routes'
import { RouterModule } from '@angular/router'
import { HttpClientModule } from '@angular/common/http'

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  providers: [HttpClientModule]
})
export class SijupriAdminModule {}
