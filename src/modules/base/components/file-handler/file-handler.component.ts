import { CommonModule } from '@angular/common'
import { Component, Input } from '@angular/core'
import { FilePreviewService } from '../../services/file-preview.service'
import { FIleHandler } from '../../commons/file-handler/file-handler'
import { FileConverterService } from '../../services/file-converter.service'
import { BehaviorSubject } from 'rxjs'

@Component({
  selector: 'app-file-handler',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-handler.component.html',
  styleUrl: './file-handler.component.scss'
})
export class FileHandlerComponent {
  @Input() inputs: FIleHandler

  fileNames: { [key: string]: string } = {}

  hadItemsLoading$ = new BehaviorSubject<boolean>(false)

  defaultImage: string = 'assets/eyegil/default-file-handler.jpg'

  constructor (
    private filePreviewService: FilePreviewService,
    private fileConverterService: FileConverterService
  ) {}

  ngOnInit () {
    // Set default file names on load if available
    for (const key in this.inputs.files) {
      if (this.inputs.files[key].fileName && this.inputs.files[key].source) {
        this.hadItemsLoading$.next(true)
        this.fileNames[key] = this.inputs.files[key].fileName
        this.fileConverterService
          .getFileAsBase64(this.inputs.files[key].source)
          .subscribe({
            next: base64 => {
              this.inputs.listen(
                key,
                base64,
                base64,
                this.inputs.files[key].label
              )
            },
            complete: () => {
              this.hadItemsLoading$.next(false)
            }
          })
      }
    }
  }

  handleFileUpload (event: any, key: any) {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()

      reader.onload = (e: any) => {
        const base64Data = e.target.result
        const source = e.target.result
        const label = this.inputs.files[key].label
        const id = this.inputs.files[key].id
        this.inputs.files[key].source = source
        this.fileNames[key] = file.name // Update displayed file name
        this.fileNames[key] = file.id
        this.inputs.listen(key, source, base64Data, label, id)
      }

      reader.readAsDataURL(file)
    }
  }

  isImage (source: string): boolean {
    if (!source) return false
    return source.startsWith('data:image/')
  }

  previewFile (fileName: string, fileSource: string) {
    this.filePreviewService.open(fileName, fileSource)
  }
}
