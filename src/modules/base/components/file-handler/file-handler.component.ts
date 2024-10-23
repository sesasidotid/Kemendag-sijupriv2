import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FilePreviewService } from '../../services/file-preview.service';
import { FIleHandler } from '../../commons/file-handler/file-handler';

@Component({
  selector: 'app-file-handler',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-handler.component.html',
  styleUrl: './file-handler.component.scss'
})
export class FileHandlerComponent {
  @Input() inputs: FIleHandler;

  defaultImage: string = 'assets/eyegil/default-file-handler.jpg';

  constructor(private filePreviewService: FilePreviewService) { }

  handleFileUpload(event: any, key: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        const base64Data = e.target.result;
        const source = e.target.result;
        const label = this.inputs.files[key].label
        this.inputs.files[key].source = source;

        this.inputs.listen(key, source, base64Data, label);
      };
      reader.readAsDataURL(file);
    }
  }

  isImage(source: string): boolean {
    if (!source) return false;
    return source.startsWith('data:image/');
  }

  previewFile(fileName: string, fileSource: string) {
    this.filePreviewService.open(fileName, fileSource);
  }
}



