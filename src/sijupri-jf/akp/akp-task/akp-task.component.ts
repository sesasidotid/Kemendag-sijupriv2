import { Component } from '@angular/core';
import { ApiService } from '../../../modules/base/services/api.service';
import { HandlerService } from '../../../modules/base/services/handler.service';
import { LoginContext } from '../../../modules/base/commons/login-context';
import { JF } from '../../../modules/siap/models/jf.model';

@Component({
  selector: 'app-akp-task',
  standalone: true,
  imports: [],
  templateUrl: './akp-task.component.html',
  styleUrl: './akp-task.component.scss'
})
export class AkpTaskComponent {
  jf: JF = new JF();

  constructor(
    private apiService: ApiService,
    private handlerService: HandlerService
  ) { }

  ngOnInit() {
    this.getJF();
  }

  getJF() {
    this.apiService.getData(`/api/v1/jf/${LoginContext.getUserId()}`).subscribe({
      next: (response) => this.jf = new JF(response),
      error: (error) => {
        this.handlerService.handleException(error);
      }
    })
  }
}
