import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface CustomButtonParams extends ICellRendererParams {
    onClickButtonOne: (data?: any) => void;
    onClikButtonTwo: (data?: any) => void;
    showFirstButton: (params: any) => boolean;
    showSecondButton: (params: any) => boolean;
    disabledFirstButton: (params: any) => boolean;
    disabledSecondButton: (params: any) => boolean;
    titleFirst: string;
    iconFirst?: string;
    colorFirst?: string;
    titleSecond: string;
    iconSecond?: string;
    colorSecond?: string;
}

@Component({
    standalone: true,
    imports : [CommonModule],
    templateUrl: './rekap-button.component.html',
})
export class RekapButtonComponent implements ICellRendererAngularComp {
    params: CustomButtonParams;

    agInit(params: CustomButtonParams): void {
        if(params) {
            this.params = params
        }
    }
    onFirstButtonClick() {
        if (this.params.onClickButtonOne) {
            this.params.onClickButtonOne(this.params.data);
          }
    }
    onSecondButtonClick() {
        if (this.params.onClikButtonTwo) {
            this.params.onClikButtonTwo(this.params.data);
        }
    }
    refresh(params: CustomButtonParams) {
        return true;
    }
}