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
  compressed: File[] = [];
  allFiles: File[] = [];

  constructor(private fileStorageService: FileStorageService, private router: Router) { }

  ngOnInit(): void {
    this.decodedFolder = atob(this.folderEncoded);
  }

  selectFiles(event: any) {
    this.compressingFiles = true;
    this.filesSelected = event.target.files;

    Array.from(this.filesSelected).forEach(file => {
      const fileType = file.type.split('/')[0];
      if (fileType === 'image') {
        this.compressImage(file);
      } else {
        this.allFiles.push(file);
      }
    });

    this.compressingFiles = false;
  }

  onUpload() {
    const form = new FormData();
    const files: FileList = this.filesSelected;
    Array.from(files).forEach(file => {
      form.append('files', file);
    });

    this.fileStorageService.uploadFile(form, this.decodedFolder).subscribe((event: any) => {
      if (event.type === HttpEventType.Response) {
        this.reloadFolder();
      }
    }, (error: any) => {
      console.error(error);
      this.reloadFolder();
    })
  }

  compressImage(file: File) {
    console.log(file);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event: any) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = (event: any) => {
        const canvas = this.defineCanvas(event);
        this.createBlob(canvas, event);
      };
    };
  }

  private defineCanvas(event: any): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    const MAX_WIDTH = 250;
    const scale = MAX_WIDTH / event.target.width;
    canvas.width = MAX_WIDTH;
    canvas.height = event.target.height * scale;
    return canvas;
  }

  private createBlob(canvas: HTMLCanvasElement, event: any) {
    const ctx = <CanvasRenderingContext2D>canvas.getContext('2d');
    ctx.drawImage(event.target, 0, 0, canvas.width, canvas.height);
    ctx.canvas.toBlob((blob: Blob) => {
      console.log(blob);
    });
  }

  reloadFolder() {
    const uuid = atob(this.uuidEncoded);
    // const folder = btoa(this.folderEncoded);  do wywalenia, sprawdź
    this.router.navigate(['/user', 'starter', 'profile', uuid])
      .then(() => this.router.navigate(['/user', 'starter', 'folder', this.uuidEncoded, this.folderEncoded]));
  }

}
