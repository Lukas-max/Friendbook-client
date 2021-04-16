import { Component, OnInit, Input } from '@angular/core';
import { FileStorageService } from 'src/app/services/file-storage.service';
import { HttpEventType } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements OnInit {
  @Input() uuidEncoded: string;
  @Input() folderEncoded: string;
  decodedFolder: string;
  compressingFiles: boolean = false;
  filesSelected: FileList;
  // here types of file to send:
  imageFiles: File[] = [];
  otherFilesAndCompressedImages: File[] = [];

  constructor(private fileStorageService: FileStorageService, private router: Router) { }

  ngOnInit(): void {
    this.decodedFolder = atob(this.folderEncoded);
  }

  selectFiles(event: any): void {
    this.filesSelected = event.target.files;

    Array.from(this.filesSelected).forEach(file => {
      const fileType = file.type.split('/')[0];
      if (fileType === 'image') {
        this._compressImage(file);
        this.imageFiles.push(file);
      } else {
        this.otherFilesAndCompressedImages.push(file);
      }
    });
  }

  onUpload() {
    if (!this.filesSelected) return;
    if (this.otherFilesAndCompressedImages.length > 0)
      this._uploadFiles();
    if (this.imageFiles.length > 0)
      this._uploadImages();

  }

  _uploadFiles() {
    const form = new FormData();
    this.otherFilesAndCompressedImages.forEach(file => form.append('files', file));

    this.fileStorageService.uploadFile(form, this.decodedFolder).subscribe((event: any) => {
      if (event.type === HttpEventType.Response) {
        this._reloadFolder();
      }
    }, (error: any) => {
      console.error(error);
      this._reloadFolder();
    });
  }

  _uploadImages() {
    const form = new FormData();
    this.imageFiles.forEach(file => form.append('files', file));
    this.fileStorageService.uploadImage(form, this.decodedFolder).subscribe((event: any) => {
      if (event.type === HttpEventType.Response) {
        this._reloadFolder();
      };
    }, (error: any) => {
      console.error(error);
      this._reloadFolder();
    });
  }


  //----------------------------------------------------------------------------------
  //----------------------------------------------------------------------------------
  _compressImage(file: File): void {
    this.compressingFiles = true;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event: any) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = (event: any) => {
        const canvas = this._defineCanvas(event);
        this._createBlob(canvas, event, file);
        this.compressingFiles = false;
      };
    };
  }

  _defineCanvas(event: any): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    const MAX_WIDTH = 250;
    const scale = MAX_WIDTH / event.target.width;
    canvas.width = MAX_WIDTH;
    canvas.height = event.target.height * scale;
    return canvas;
  }

  _createBlob(canvas: HTMLCanvasElement, event: any, file: File): void {
    const ctx = <CanvasRenderingContext2D>canvas.getContext('2d');
    ctx.drawImage(event.target, 0, 0, canvas.width, canvas.height);
    ctx.canvas.toBlob((blob: Blob) => {
      const newFile: File = new File([blob], file.name, { lastModified: new Date().getTime(), type: blob.type });
      this.otherFilesAndCompressedImages.push(newFile);
    }, 'image/jpeg', 0.3);
  }

  _renameFileExtension(name: string): string {
    const fileSplit = name.split('.');
    const length = fileSplit.length;
    fileSplit[length - 1] = 'jpeg';
    return fileSplit.join('.');
  }
  //----------------------------------------------------------------------------------------
  //----------------------------------------------------------------------------------------

  _reloadFolder(): void {
    this.router.navigate(['/user', 'starter', 'dummy'], { skipLocationChange: true })
      .then(() => this.router.navigate(['/user', 'starter', 'folder', this.uuidEncoded, this.folderEncoded]));
  }

}
