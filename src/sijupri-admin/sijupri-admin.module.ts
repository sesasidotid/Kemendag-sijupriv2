import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { routes } from './sijupri-admin.routes';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class SijupriAdminModule { }
