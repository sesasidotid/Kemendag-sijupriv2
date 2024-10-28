import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ApiService } from '../../../modules/base/services/api.service';
import { AlertService } from '../../../modules/base/services/alert.service';
import { ConfirmationService } from '../../../modules/base/services/confirmation.service';
import { Router } from '@angular/router';
import { Pagable } from '../../../modules/base/commons/pagable/pagable';
import { Ukom } from '../../../modules/ukom/models/ukom.model';
import { FormsModule } from '@angular/forms';
import { HandlerService } from '../../../modules/base/services/handler.service';
import { TabService } from '../../../modules/base/services/tab.service';
import { LoginContext } from '../../../modules/base/commons/login-context';

@Component({
  selector: 'app-ukom-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ukom-add.component.html',
  styleUrl: './ukom-add.component.scss'
})
export class UkomAddComponent {
  ukom: Ukom = new Ukom();
  editorContent: string = '';
  init: any;
  pagable: Pagable;

  constructor(
    private apiService: ApiService,
    private handlerService: HandlerService,
    private confirmationService: ConfirmationService,
    private tabService: TabService
  ) { }

  ngOnInit() {
    this.tabService.addTab({
      label: 'Daftar UKom',
      icon: 'mdi-list-box',
      onClick: () => this.handlerService.handleNavigate('/ukom/ukom-list'),
    }).addTab({
      label: 'Tambah UKom',
      isActive: true,
      icon: 'mdi-plus-circle',
      onClick: () => this.handlerService.handleNavigate('/ukom/ukom-list/add'),
    });
  }

  submit() {
    this.confirmationService.open(false).subscribe({
      next: (result) => {
        if (!result.confirmed) return;

        this.apiService.postData("/api/v1/ukom", this.ukom).subscribe({
          next: (response) => {
            this.handlerService.handleNavigate('/ukom/ukom-list');
          },
          error: (error) => {
            this.handlerService.handleException(error);
          }
        });
      }
    })
  }
}
