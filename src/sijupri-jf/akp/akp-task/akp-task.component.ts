import { Component } from '@angular/core';
import { ApiService } from '../../../modules/base/services/api.service';
import { HandlerService } from '../../../modules/base/services/handler.service';
import { LoginContext } from '../../../modules/base/commons/login-context';
import { JF } from '../../../modules/siap/models/jf.model';
import { AKPTask } from '../../../modules/akp/models/akp-task.model';
import { AkpTaskService } from '../../../modules/akp/services/akp-task.service';
import { CommonModule } from '@angular/common';
import { EmptyStateComponent } from '../../../modules/base/components/empty-state/empty-state.component';
import { AlertService } from '../../../modules/base/services/alert.service';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-akp-task',
  standalone: true,
  imports: [CommonModule, EmptyStateComponent],
  templateUrl: './akp-task.component.html',
  styleUrl: './akp-task.component.scss'
})
export class AkpTaskComponent {
  jf: JF = new JF();
  AKPTask: AKPTask = new AKPTask();

  wannaRequest: boolean = false;

  akpDataLoading$ = new BehaviorSubject<boolean>(true);
  akpStep$ = new BehaviorSubject<number>(1);
  currentAKPStep$ = new BehaviorSubject<number>(1); //static


  constructor(
    private apiService: ApiService,
    private akpTaskService: AkpTaskService,
    private handlerService: HandlerService,
    private alertService: AlertService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.getJF();
    this.getAKPTask();
  }

  getJF() {
    this.apiService.getData(`/api/v1/jf/${LoginContext.getUserId()}`).subscribe({
      next: (response) => this.jf = new JF(response),
      error: (error) => {
        this.handlerService.handleException(error);
      }
    })
  }

  getAKPTask() {
    this.akpDataLoading$.next(true);
    this.akpTaskService.findByNip(LoginContext.getUserId()).subscribe({
      next: (response) => {
        this.AKPTask = new AKPTask(response)

        switch (this.AKPTask.flowId) {
          case 'akp_flow_1':
            this.akpStep$.next(1);
            this.currentAKPStep$.next(1);
            break;
          case 'akp_flow_2':
            this.akpStep$.next(2);
            this.currentAKPStep$.next(2);
            break;
          case 'akp_flow_3':
            this.akpStep$.next(3);
            this.currentAKPStep$.next(3);
            break;
          case 'akp_flow_4':
            this.akpStep$.next(4);
            this.currentAKPStep$.next(4);
            break;
          default:
            break
        }

        this.akpDataLoading$.next(false);
        console.log(this.currentAKPStep$)
      },
      error: (error) => {
        this.akpDataLoading$.next(false);
      }
    })
  }

  saveAKPTask() {
    this.akpTaskService.saveTask(LoginContext.getUserId()).subscribe({
      next: () => {
        this.alertService.showToast('Success', 'Berhasil mengajukan data');
        setTimeout(() => {
          this.router.navigate(['/akp/akp-task']).then(() => { window.location.reload() });
        }, 2000);
      },
      error: (error) => {
        
      }
    })
  }

  reqChange() {
    this.wannaRequest = !this.wannaRequest;
  }

  handleStepClick(clickedStep: number) {
    this.currentAKPStep$.subscribe((step) => {
      if (clickedStep <= step) {
        this.akpStep$.next(clickedStep);
      }
    });
  }

  ngOnDestroy() {
    this.akpDataLoading$.unsubscribe();
    this.akpStep$.unsubscribe();
    this.currentAKPStep$.unsubscribe();
  }
}
