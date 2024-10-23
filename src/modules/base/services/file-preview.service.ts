import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FilePreviewService {
  private filePreviewSubject = new Subject<{ fileName: string, fileSource: string }>();
  filePreviewObservable = this.filePreviewSubject.asObservable();

  // Method to open the preview with file name and source
  open(fileName: string, fileSource: string) {
    this.filePreviewSubject.next({ fileName, fileSource });
  }
}
