import { Component, OnInit, Input, OnDestroy, NgZone, OnChanges, ChangeDetectorRef } from '@angular/core';
import { FileStorageService } from 'src/app/services/file-storage.service';
import { HttpEventType } from '@angular/common/http';
import { Router } from '@angular/router';
import { CompressService } from 'src/app/services/compress.Service';
import { Subscription } from 'rxjs';
import { ToastService } from 'src/app/services/toast.service';
import { CompressType } from 'src/app/model/files/compressType';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements OnInit, OnDestroy {
  @Input() userUUID: string;
  @Input() folder: string;
  filesSelected: FileList;
  compressedImageIconSubscription: Subscription;
  compressedImageSubscription: Subscription;
  // here are the types of file to send:
  imageFiles: File[] = [];
  otherFilesPlusCompressedImageIcons: File[] = [];
  // file upload flags and progress tracking:
  uploadBlock = true;
  compressingFiles: boolean = false;
  imagesToCompress = 0;
  imagesCompressed = 0;
  uploadingFiles = false;
  fileProgress = 0;

  constructor(
    private fileStorageService: FileStorageService,
    private router: Router,
    private compressService: CompressService,
    private toast: ToastService,
    private viewRef: ChangeDetectorRef) { }


  ngOnInit(): void {
    this.subscribeToImageIconCompressor();
    this.subscribeToImageCompressor();
  }

  subscribeToImageIconCompressor(): void {
    this.compressedImageIconSubscription = this.compressService.compressedImageIconSubject.subscribe((file: File) => {
      this.otherFilesPlusCompressedImageIcons.push(file);
      this.imagesCompressed++;
      this.isCompressing();
    },
      (error: any) => this.toast.onError(error.error.message));
  }

  subscribeToImageCompressor(): void {
    this.compressedImageSubscription = this.compressService.compressedImageSubject.subscribe((file: File) => {
      this.imageFiles.push(file);
      this.imagesCompressed++;
      this.isCompressing();
    },
      (error: any) => this.toast.onError(error.error.message));
  }

  selectFiles(event: any): void {
    this.otherFilesPlusCompressedImageIcons = [];
    this.imageFiles = [];
    this.compressingFiles = false;
    this.imagesToCompress = 0;
    this.imagesCompressed = 0;
    this.filesSelected = event.target.files;

    this.checkFileVolume();
    Array.from(this.filesSelected).forEach((file: File) => {
      const fileType = file.type.split('/')[0];
      if (fileType === 'image') {
        this.compressingFiles = true;
        this.compressService.compressImage(file, 250, 0.3, CompressType.IMAGE_ICON);
        this._directTheImageCompression(file);
      } else {
        this.otherFilesPlusCompressedImageIcons.push(file);
      }
    });
  }

  /**
   * If the file volume is to big inform the user and stop compression and upload.
   */
  checkFileVolume(): void {
    let vol = 0;
    Array.from(this.filesSelected).forEach((file: File) => {
      vol = vol + file.size;
    });

    if (vol > 64_000_000) {
      this.uploadBlock = true;
      this.toast.onError('Nie możesz wysłać tyle MB na raz.')
      throw new Error("Nie możesz wysłać tyle MB na raz.");
    }

    this.uploadBlock = false;
  }

  /**
   * 
   * If the volume is less than 350KB, dont compress the Image, compress only the for the imageIcon. Othewise compress the image, and for the icon,
   * and set 
   */
  _directTheImageCompression(file: File): void {
    if (file.size < 350_000) {
      this.imageFiles.push(file);
      this.imagesToCompress++;
    }
    else if (file.size < 800_000) {
      this.compressService.compressImage(file, 0, 0.7, CompressType.IMAGE);
      this.imagesToCompress = this.imagesToCompress + 2;
    }
    else if (file.size < 1_800_000) {
      this.compressService.compressImage(file, 0, 0.5, CompressType.IMAGE);
      this.imagesToCompress = this.imagesToCompress + 2;
    }
    else {
      this.compressService.compressImage(file, 0, 0.3, CompressType.IMAGE);
      this.imagesToCompress = this.imagesToCompress + 2;
    }
  }

  onUpload(): void {
    if (!this.filesSelected && this.otherFilesPlusCompressedImageIcons.length === 0) return;
    this.uploadingFiles = true;
    if (this.imageFiles.length === 0)
      this._uploadFiles();
    if (this.imageFiles.length > 0)
      this._uploadFilesAndImages();

  }

  _uploadFiles(): void {
    const form = new FormData();
    this.otherFilesPlusCompressedImageIcons.forEach(file => form.append('files', file));
    this.fileStorageService.uploadFile(form, this.folder, false).subscribe((event: any) => {
      this.onUploadFiles(event);
    }, (error: any) => {
      this.toast.onError('Możesz wysłać jednocześnie nie więcej niż 64 MB');
      this.toast.onError(error.error.message)
      this._reloadFolder();
    });
  }

  _uploadFilesAndImages(): void {
    const form = new FormData();
    this.otherFilesPlusCompressedImageIcons.forEach(file => form.append('files', file));
    this.imageFiles.forEach(file => form.append('images', file));
    this.fileStorageService.uploadFile(form, this.folder, true).subscribe((event: any) => {
      this.onUploadFiles(event);
    }, (error: any) => {
      this.toast.onError('Możesz wysłać jednocześnie nie więcej niż 64 MB');
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

  isCompressing(): void {
    this.compressingFiles = this.imagesToCompress !== this.imagesCompressed;

    if (this.compressService) {
      this.viewRef.detectChanges();
    }
  }

  _reloadFolder(): void {
    this.router.navigate(['/user', 'starter', 'dummy'], { skipLocationChange: true })
      .then(() => this.router.navigate(['/user', 'starter', 'folder', this.userUUID, this.folder]));
  }

  ngOnDestroy(): void {
    this.compressedImageIconSubscription.unsubscribe();
    this.compressedImageSubscription.unsubscribe();
  }

}
