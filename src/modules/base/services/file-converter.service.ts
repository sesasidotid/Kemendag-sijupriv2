import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileConverterService {
  constructor(private http: HttpClient) {}

  getFileAsBase64(url: string): Observable<string> {
    return new Observable(observer => {
      // Fetch the file as a Blob
      this.http.get(url, { responseType: 'blob' }).subscribe({
        next: (blob) => {
          // Convert Blob to base64
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result as string;
            observer.next(base64String);
            observer.complete();
          };
          reader.onerror = (error) => observer.error(error);
          reader.readAsDataURL(blob); // This converts to base64 format
        },
        error: (error) => observer.error(error)
      });
    });
  }
}
