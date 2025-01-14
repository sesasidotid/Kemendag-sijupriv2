import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { ApiService } from '../../../modules/base/services/api.service'
import { EditorModule } from '@tinymce/tinymce-angular'
import 'tinymce/tinymce'
import 'tinymce/icons/default'
import 'tinymce/themes/silver'
import 'tinymce/plugins/image'
import 'tinymce/plugins/code'
import { AlertService } from '../../../modules/base/services/alert.service'
import { ConfirmationService } from '../../../modules/base/services/confirmation.service'
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component'
import { Router } from '@angular/router'
import {
  ActionColumnBuilder,
  PagableBuilder,
  PageFilterBuilder,
  PrimaryColumnBuilder
} from '../../../modules/base/commons/pagable/pagable-builder'
import { Pagable } from '../../../modules/base/commons/pagable/pagable'
import { Ukom } from '../../../modules/ukom/models/ukom.model'
import { TabService } from '../../../modules/base/services/tab.service'
import { LoginContext } from '../../../modules/base/commons/login-context'

@Component({
  selector: 'app-ukom-periode-add',
  standalone: true,
  imports: [CommonModule, FormsModule, EditorModule, PagableComponent],
  templateUrl: './ukom-periode-add.component.html',
  styleUrl: './ukom-periode-add.component.scss'
})
export class UkomPeriodeAddComponent {
  ukom: Ukom = new Ukom()
  editorContent: string = ''
  init: any
  pagable: Pagable

  constructor (private tabService: TabService, private router: Router) {
    this.pagable = new PagableBuilder('/api/v1/ukom/search').build()
  }

  ngOnInit () {
    if (this.tabService.getTabsLength() > 0) {
      this.tabService.clearTabs()
    }

    this.tabService
      .addTab({
        label: 'Daftar User Instansi',
        icon: 'mdi-list-box',
        onClick: () => this.router.navigate(['/ukom/ukom-periode'])
      })
      .addTab({
        label: 'Tambah User Instansi',
        icon: 'mdi-plus-circle',
        isActive: true,
        onClick: () => this.router.navigate(['/ukom/ukom-periode/add'])
      })
  }
}
