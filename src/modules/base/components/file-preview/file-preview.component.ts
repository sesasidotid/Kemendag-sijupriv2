import { Component, OnInit } from '@angular/core';
import { FilePreviewService } from '../../services/file-preview.service';
import { SafeUrlPipe } from '../../pipes/safe-url.pipe';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-file-preview',
  standalone: true,
  imports: [CommonModule, SafeUrlPipe],
  templateUrl: './file-preview.component.html',
  styleUrl: './file-preview.component.scss'
})
export class FilePreviewComponent implements OnInit {
  fileName: string = '';
  fileSource: string = '';
  showModal: boolean = false;

  constructor(private filePreviewService: FilePreviewService) { }

  ngOnInit() {
    // Subscribe to the service to receive the filename and file source
    this.filePreviewService.filePreviewObservable.subscribe(({ fileName, fileSource }) => {
      this.fileName = fileName;
      this.fileSource = fileSource;
      this.showModal = true;  // Show modal when triggered
    });
  }

  // Method to close the modal
  closeModal() {
    this.showModal = false;
  }
}
