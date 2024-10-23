import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable, Subscription } from 'rxjs';
import { LoginContext } from '../commons/login-context';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl: string = "http://localhost:8000"

  constructor(private http: HttpClient) { }

  public auth(path: string, data: any, customHeader: any = null): Observable<any> {
    const headers = this.createHeader(customHeader || {
      'Content-Type': 'application/json',
    });

    return this.http.post(`${this.baseUrl}${path}`, data, { headers });
  }

  public downloadData(path: string, expectedFileName: string = "downloaded", customHeader: any = null): Observable<void> {
    const headers = this.createHeader(customHeader || {
      'Authorization': `Bearer ${LoginContext.getAccessToken()}`,
      'Accept': 'application/octet-stream'
    });

    return this.http.get(`${this.baseUrl}${path}`, {
      headers,
      responseType: 'blob'
    }).pipe(
      map((blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = expectedFileName;
        a.click();
        window.URL.revokeObjectURL(url);
      })
    );
  }

  public getData(path: string, customHeader: any = null): Observable<any> {
    const headers = this.createHeader(customHeader || {
      'Authorization': `Bearer ${LoginContext.getAccessToken()}`
    });

    return this.http.get(`${this.baseUrl}${path}`, { headers });
  }

  public postData(path: string, data: any, customHeader: any = null): Observable<any> {
    const headers = this.createHeader(customHeader || {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LoginContext.getAccessToken()}`
    });

    return this.http.post(`${this.baseUrl}${path}`, data, { headers });
  }

  public putData(path: string, data: any, customHeader: any = null): Observable<any> {
    const headers = this.createHeader(customHeader || {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LoginContext.getAccessToken()}`
    });

    return this.http.put(`${this.baseUrl}${path}`, data, { headers });
  }

  public deleteData(path: string, customHeader: any = null): Observable<any> {
    const headers = this.createHeader(customHeader || {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LoginContext.getAccessToken()}`
    });

    return this.http.delete(`${this.baseUrl}${path}`, { headers });
  }

  private createHeader(headerObject: any): HttpHeaders {
    return new HttpHeaders(headerObject);
  }
}
