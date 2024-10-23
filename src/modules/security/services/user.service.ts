import { Injectable } from '@angular/core';
import { ApiService } from '../../base/services/api.service';
import { User } from '../models/user.model';
import { catchError, map, Observable } from 'rxjs';
import { AlertService } from '../../base/services/alert.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  readonly BASE_PATH = '/api/v1/user'

  constructor(
    private apiService: ApiService,
    private alertService: AlertService
  ) { }

  findAll(): Observable<User[]> {
    return this.apiService.getData(this.BASE_PATH).pipe(
      map((response: any) => {
        return response.map((user: { [key: string]: any; }) => new User(user));
      }),
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }

  save(user: User): Observable<void> {
    return this.apiService.postData(this.BASE_PATH, user).pipe(
      catchError((error) => {
        console.error('Error save data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }

  update(user: User): void {
    this.apiService.putData(this.BASE_PATH, user).pipe(
      catchError((error) => {
        console.error('Error update data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }

  delete(id: string): void {
    this.apiService.deleteData(`${this.BASE_PATH}/${id}`).pipe(
      catchError((error) => {
        console.error('Error delete data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }
}
