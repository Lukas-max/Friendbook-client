import { Component, OnInit, Input, OnDestroy, NgZone } from '@angular/core';
import { FileStorageService } from 'src/app/services/file-storage.service';
import { HttpEventType } from '@angular/common/http';
import { Router } from '@angular/router';
import { CompressService } from 'src/app/services/compress.Service';
import { Subscription } from 'rxjs';
import { ToastService } from '../toast.service';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements OnInit, OnDestroy {
  @Input() userUUID: string;
  @Input() folder: string;
  compressingFiles: boolean = false;
  filesSelected: FileList;
  compressingFileSubscription: Subscription;
  compressedImageSubscription: Subscription;
  // here are the types of file to send:
  imageFiles: File[] = [];
  otherFilesAndCompressedImages: File[] = [];
  // file upload flags and progress tracking:
  uploadingFiles = false;
  fileProgress = 0;

  constructor(
    private fileStorageService: FileStorageService,
    private router: Router,
    private compressService: CompressService,
    private toast: ToastService) { }

  /**
   * - CompressingFileSubject sends a true flag if the service is compressing an image file.
   * - CompressedImageSubject sends the image when compressed.
   */
  ngOnInit(): void {
    this.compressingFileSubscription = this.compressService.compressingFileSubject.subscribe((flag: boolean) => this.compressingFiles = flag,
      (error: any) => this.toast.onError(error.error.message));
    this.compressedImageSubscription = this.compressService.compressedImageSubject.subscribe((file: File) => this.otherFilesAndCompressedImages.push(file),
      (error: any) => this.toast.onError(error.error.message))
  }

  selectFiles(event: any): void {
    this.otherFilesAndCompressedImages = [];
    this.imageFiles = [];
    this.filesSelected = event.target.files;

    Array.from(this.filesSelected).forEach(file => {
      const fileType = file.type.split('/')[0];
      if (fileType === 'image') {
        this.compressService.compressImage(file, 250, 0.3);
        this.imageFiles.push(file);
      } else {
        this.otherFilesAndCompressedImages.push(file);
      }
    });
  }

  onUpload() {
    if (!this.filesSelected && this.otherFilesAndCompressedImages.length === 0) return;
    this.uploadingFiles = true;
    if (this.imageFiles.length === 0)
      this._uploadFiles();
    if (this.imageFiles.length > 0)
      this._uploadFilesAndImages();

  }

  _uploadFiles(): void {
    const form = new FormData();
    this.otherFilesAndCompressedImages.forEach(file => form.append('files', file));
    this.fileStorageService.uploadFile(form, this.folder, false).subscribe((event: any) => {
      this.onUploadFiles(event);
    }, (error: any) => {
      this.toast.onError(error.error.message)
      this._reloadFolder();
    });
  }

  _uploadFilesAndImages(): void {
    const form = new FormData();
    this.otherFilesAndCompressedImages.forEach(file => form.append('files', file));
    this.imageFiles.forEach(file => form.append('images', file));
    this.fileStorageService.uploadFile(form, this.folder, true).subscribe((event: any) => {
      this.onUploadFiles(event);
    }, (error: any) => {
      this.toast.onError(error.error.message)
      this._reloadFolder();
    });
  }

  private onUploadFiles(event: any): void {
    if (event.type === HttpEventType.UploadProgress) {
      this.fileProgress = Math.round(100 * (event.loaded / event.total));
    }

    if (event.type === HttpEventType.Response) {
      this._reloadFolder();
    }
  }

  _reloadFolder(): void {
    this.router.navigate(['/user', 'starter', 'dummy'], { skipLocationChange: true })
      .then(() => this.router.navigate(['/user', 'starter', 'folder', this.userUUID, this.folder]));
  }

  ngOnDestroy(): void {
    this.compressedImageSubscription.unsubscribe();
    this.compressingFileSubscription.unsubscribe();
  }

}
