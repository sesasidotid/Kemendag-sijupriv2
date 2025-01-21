import { ActivatedRoute } from '@angular/router'
import { ApiService } from './../../../modules/base/services/api.service'
import { Component } from '@angular/core'

@Component({
  selector: 'app-ukom-task-detail',
  standalone: true,
  imports: [],
  templateUrl: './ukom-task-detail.component.html',
  styleUrl: './ukom-task-detail.component.scss'
})
export class UkomTaskDetailComponent {
  id: string
  constructor (
    private ApiService: ApiService,
    private activatedRoute: ActivatedRoute
  ) {
    this.activatedRoute.paramMap.subscribe(params => {
      this.id = params.get('id')
    })
    this.getUkomDetail()
  }

  getUkomDetail () {
    this.ApiService.getData(`/api/v1/participant_ukom/${this.id}`).subscribe({
      next: res => {
        console.log(res)
      },
      error: err => {
        console.error('Error:', err)
      }
    })
  }
}
