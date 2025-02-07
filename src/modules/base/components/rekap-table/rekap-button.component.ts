import { ICellRendererAngularComp } from 'ag-grid-angular'
import { ICellRendererParams } from 'ag-grid-community'
import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'

interface CustomButtonParams extends ICellRendererParams {
  onClickButtonOne: (data?: any) => void
  onClickButtonTwo: (data?: any) => void
  showFirstButton: (params: any) => boolean
  showSecondButton: (params: any) => boolean
  disabledFirstButton: (params: any) => boolean
  disabledSecondButton: (params: any) => boolean
  titleFirst: (params: any) => string
  iconFirst?: string
  colorFirst?: (params: any) => string
  titleSecond: (params: any) => string
  iconSecond?: string
  colorSecond?: (params: any) => string
}

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rekap-button.component.html'
})
export class RekapButtonComponent implements ICellRendererAngularComp {
  params: CustomButtonParams

  agInit (params: CustomButtonParams): void {
    if (params) {
      this.params = params
    }
    console.log('params', params)
  }

  onFirstButtonClick () {
    if (this.params.onClickButtonOne) {
      this.params.onClickButtonOne(this.params.data)
    }
  }

  onSecondButtonClick () {
    if (this.params.onClickButtonTwo) {
      this.params.onClickButtonTwo(this.params.data)
    }
  }

  refresh (params: CustomButtonParams) {
    return true
  }
}
