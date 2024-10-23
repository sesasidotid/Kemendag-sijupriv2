import { Injectable } from '@angular/core';
import { ApiService } from '../../base/services/api.service';
import { Menu } from '../models/menu.mode';
import { catchError, map, Observable } from 'rxjs';
import { AlertService } from '../../base/services/alert.service';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  readonly BASE_PATH = '/api/v1/menu'

  constructor(
    private apiService: ApiService,
    private alertService: AlertService
  ) { }

  findAll(): Observable<Menu[]> {
    return this.apiService.getData(this.BASE_PATH).pipe(
      map((response: any) => {
        return response.map((role: { [key: string]: any; }) => new Menu(role));
      }),
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }

  findTree(): Observable<Menu[]> {
    return this.apiService.getData(`${this.BASE_PATH}/tree`).pipe(
      map((response: any) => {
        return response.map((role: { [key: string]: any; }) => new Menu(role));
      }),
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }

  findTreeByRoleCodeAndApplicationCode(roleCode: string, applicationCode: string): Observable<Menu[]> {
    return this.apiService.getData(`${this.BASE_PATH}/tree/${roleCode}/${applicationCode}`).pipe(
      map((response: any) => {
        return response.map((role: { [key: string]: any; }) => new Menu(role));
      }),
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }
}
