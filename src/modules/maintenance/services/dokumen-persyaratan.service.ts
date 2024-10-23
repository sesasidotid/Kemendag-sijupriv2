import { Injectable } from '@angular/core';
import { catchError, map, Observable } from 'rxjs';
import { ApiService } from '../../base/services/api.service';
import { AlertService } from '../../base/services/alert.service';
import { DokumenPersyaratan } from '../models/dokumen-persyaratan.model';

@Injectable({
  providedIn: 'root'
})
export class DokumenPersyaratanService {
  readonly BASE_PATH = '/api/v1/doc_persyaratan'

  constructor(
    private apiService: ApiService,
    private alertService: AlertService
  ) { }

  findAll(): Observable<DokumenPersyaratan[]> {
    return this.apiService.getData(this.BASE_PATH).pipe(
      map((response: any) => {
        return response.map((dokumenPersyaratan: { [key: string]: any; }) => new DokumenPersyaratan(dokumenPersyaratan));
      }),
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }

  findByAssociation(association: string): Observable<DokumenPersyaratan[]> {
    return this.apiService.getData(`${this.BASE_PATH}/association/${association}`).pipe(
      map((response: any) => {
        return response.map((dokumenPersyaratan: { [key: string]: any; }) => new DokumenPersyaratan(dokumenPersyaratan));
      }),
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }

  findById(id: string): Observable<DokumenPersyaratan> {
    return this.apiService.getData(`${this.BASE_PATH}/${id}`).pipe(
      map((response: any) => {
        return new DokumenPersyaratan(response);
      }),
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }

  save(dokumenPersyaratan: DokumenPersyaratan): Observable<void> {
    return this.apiService.postData(this.BASE_PATH, dokumenPersyaratan).pipe(
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }

  delete(id: string): Observable<void> {
    return this.apiService.deleteData(`${this.BASE_PATH}/${id}`).pipe(
      catchError((error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      })
    );
  }
}
