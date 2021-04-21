import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FileStorageService } from 'src/app/services/file-storage.service';
import { HttpEventType } from '@angular/common/http';
import { Router } from '@angular/router';
import { CompressService } from 'src/app/services/compress.Service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements OnInit, OnDestroy {
  @Input() uuidEncoded: string;
  @Input() folderEncoded: string;
  decodedFolder: string;
  compressingFiles: boolean = false;
  filesSelected: FileList;
  compressingFileSubscription: Subscription;
  compressedImageSubscription: Subscription;
  // here are the types of file to send:
  imageFiles: File[] = [];
  otherFilesAndCompressedImages: File[] = [];

  constructor(private fileStorageService: FileStorageService, private router: Router, private compressService: CompressService) { }

  ngOnInit(): void {
    this.decodedFolder = atob(this.folderEncoded);

    this.compressingFileSubscription = this.compressService.compressingFileSubject.subscribe((flag: boolean) => this.compressingFiles = flag);
    this.compressedImageSubscription = this.compressService.compressedImageSubject.subscribe((file: File) => this.otherFilesAndCompressedImages.push(file))
  }

  selectFiles(event: any): void {
    this.otherFilesAndCompressedImages = [];
    this.imageFiles = [];
    this.filesSelected = event.target.files;

    Array.from(this.filesSelected).forEach(file => {
      const fileType = file.type.split('/')[0];
      if (fileType === 'image') {
        this.compressService._compressImage(file, 250, 0.3);
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

  _reloadFolder(): void {
    this.router.navigate(['/user', 'starter', 'dummy'], { skipLocationChange: true })
      .then(() => this.router.navigate(['/user', 'starter', 'folder', this.uuidEncoded, this.folderEncoded]));
  }

  ngOnDestroy() {
    this.compressedImageSubscription.unsubscribe();
    this.compressingFileSubscription.unsubscribe();
  }

}
