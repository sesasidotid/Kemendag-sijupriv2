import { Component, OnInit, Input } from '@angular/core'
import { FilePreviewService } from '../../services/file-preview.service'
import { SafeUrlPipe } from '../../pipes/safe-url.pipe'
import { CommonModule } from '@angular/common'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'

@Component({
  selector: 'app-file-preview',
  standalone: true,
  imports: [CommonModule, SafeUrlPipe],
  templateUrl: './file-preview.component.html',
  styleUrl: './file-preview.component.scss'
})
export class FilePreviewComponent implements OnInit {
  fileName: string = ''
  fileSource: string = ''
  showModal: boolean = false

  constructor (
    private filePreviewService: FilePreviewService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit () {
    // Subscribe to the service to receive the filename and file source
    this.filePreviewService.filePreviewObservable.subscribe(
      ({ fileName, fileSource }) => {
        this.fileName = fileName
        this.fileSource = fileSource
        this.showModal = true // Show modal when triggered
      }
    )
  }

  open (fileName: string, fileSource: string) {
    this.fileName = fileName
    this.fileSource = this.fileSource
    this.showModal = true // Show modal when triggered
  }

  // Method to close the modal
  closeModal () {
    this.showModal = false
  }
}
