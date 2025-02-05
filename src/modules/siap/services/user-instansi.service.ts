import { Injectable } from '@angular/core'
import { UserInstansi } from '../models/user-instansi.model'
import { catchError, map, Observable } from 'rxjs'
import { ApiService } from '../../base/services/api.service'
import { AlertService } from '../../base/services/alert.service'

@Injectable({
  providedIn: 'root'
})
export class UserInstansiService {
  readonly BASE_PATH = '/api/v1/user_instansi'

  constructor (
    private apiService: ApiService,
    private alertService: AlertService
  ) {}

  findAll (): Observable<UserInstansi[]> {
    return this.apiService.getData(this.BASE_PATH).pipe(
      map((response: any) => {
        return response.map(
          (user: { [key: string]: any }) => new UserInstansi(user)
        )
      }),
      catchError(error => {
        console.error('Error fetching data', error)
        // this.alertService.showToast('Error', error.message)
        throw error
      })
    )
  }

  findByNip (nip: string): Observable<UserInstansi> {
    return this.apiService.getData(`${this.BASE_PATH}/${nip}`).pipe(
      map((response: any) => {
        return new UserInstansi(response)
      }),
      catchError(error => {
        console.error('Error fetching data', error)
        this.alertService.showToast('Error', error.message)
        throw error
      })
    )
  }

  save (user: UserInstansi): Observable<void> {
    return this.apiService.postData(this.BASE_PATH, user).pipe(
      catchError(error => {
        console.error('Error fetching data', error)
        this.alertService.showToast('Error', error.message)
        throw error
      })
    )
  }

  update (user: UserInstansi): Observable<void> {
    return this.apiService.putData(this.BASE_PATH, user).pipe(
      catchError(error => {
        console.error('Error fetching data', error)
        this.alertService.showToast('Error', error.message)
        throw error
      })
    )
  }

  delete (id: string): Observable<void> {
    return this.apiService.deleteData(`${this.BASE_PATH}/${id}`).pipe(
      catchError(error => {
        console.error('Error fetching data', error)
        this.alertService.showToast('Error', error.message)
        throw error
      })
    )
  }
}
