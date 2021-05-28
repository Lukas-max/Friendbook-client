import { Component, OnInit, ViewChild, OnDestroy, ElementRef, AfterViewInit, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MainFeedService } from 'src/app/services/mainFeed.service';
import { CompressService } from 'src/app/services/compress.Service';
import { Subscription } from 'rxjs';
import { FeedModelDto } from 'src/app/model/feed/feedModelDto';
import { SocketService } from 'src/app/services/socket.Service';
import { IntersectionObserverService } from 'src/app/services/intersectionObserver.service';
import { filter, switchMap } from 'rxjs/operators';
import { Chunk } from 'src/app/model/data/chunk';
import { ToastService } from 'src/app/services/toast.service';
import { HttpEventType } from '@angular/common/http';
import { CompressType } from 'src/app/model/files/compressType';

@Component({
  selector: 'app-main-feed',
  templateUrl: './main-feed.component.html',
  styleUrls: ['./main-feed.component.scss']
})
export class MainFeedComponent implements AfterViewInit, OnDestroy {
  @ViewChild('feed') form: NgForm;
  @ViewChild('filesInput') filesInput: ElementRef;
  @ViewChild('ob', { read: ElementRef }) ob: ElementRef;
  filesSelected: FileList;
  imageFiles: File[] = [];
  otherFilesPlusCompressedImageIcons: File[] = [];
  feedData: FeedModelDto[] = [];
  // subscriptions to Subject's and IntersectorObserver:
  compressingFileSubscription: Subscription;
  compressedImageIconSubscription: Subscription;
  compressedImageSubscription: Subscription;
  feedSocketSubscription: Subscription;
  deleteFeedSocketSubscription: Subscription;
  intersectorSubscription: Subscription;
  limit = 5;
  offset = 0;
  isLoading = true;
  // file upload flags and progress tracking:
  compressingFiles: boolean = false;
  uploadBlock = true;
  imagesToCompress = 0;
  imagesCompressed = 0;
  uploadingFiles = false;
  fileProgress = 0;

  constructor(
    private mainFeedService: MainFeedService,
    private compressService: CompressService,
    private socketService: SocketService,
    private intersector: IntersectionObserverService,
    private toast: ToastService,
    private viewRef: ChangeDetectorRef) { }


  ngAfterViewInit(): void {
    this.initializeMainFeed();
  }

  initializeMainFeed() {
    this.subscribeToImageIconCompressor();
    this.subscribeToImageCompressor();
    this.subscribeIntersectorLoader();
    this.subscribeFeedSubject();
    this.subscribeDeleteFeedSubject();
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
      (error: any) => this.toast.onError(error.error.message))
  }

  subscribeIntersectorLoader() {
    this.intersectorSubscription = this.intersector.createAndObserve(this.ob).pipe(
      filter((isIntersecting: boolean) => isIntersecting),
      switchMap(() => this.mainFeedService.getFeed(this.limit.toString(), this.offset.toString())))
      .subscribe((chunk: Chunk<FeedModelDto>) => {
        chunk.content.forEach(feed => this.feedData.push(feed));
        this.offset = this.feedData.length;
        this.isLoading = false;
      }, (error: any) => this.toast.onError(error.error.message));
  }

  subscribeFeedSubject() {
    this.feedSocketSubscription = this.socketService.feedSubject.subscribe((feed: FeedModelDto) => {
      this.feedData.unshift(feed);
      this.offset = this.feedData.length;
    }, (error: any) => this.toast.onError(error.error.message));
  }

  subscribeDeleteFeedSubject() {
    this.deleteFeedSocketSubscription = this.socketService.deleteFeedSubject.subscribe((id: number) => {
      const index = this.feedData.findIndex(feed => feed.feedId === id);
      this.feedData.splice(index, 1);
      this.offset = this.feedData.length;
    }, (error: any) => this.toast.onError(error.error.message));
  }

  selectFiles(event: any): void {
    this.otherFilesPlusCompressedImageIcons = [];
    this.imageFiles = [];
    this.filesSelected = event.target.files;

    this.checkFileVolume();
    Array.from(this.filesSelected).forEach(file => {
      const fileType = file.type.split('/')[0];
      if (fileType === 'image') {
        this.compressingFiles = true;
        this.compressService.compressImage(file, 250, 0.5, CompressType.IMAGE_ICON);
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
      this.toast.onError('Nie możesz wysłać tyle MB na raz.')
      throw new Error("Nie możesz wysłać tyle MB na raz.");
    }

    this.uploadBlock = false;
  }

  /**
   * 
   * If the volume is less than 350KB, dont compress. Send only one file to the server. If the volume is larger
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

  submit(): void {
    const text = this.form.value['nowy-wpis'];
    if (!text) return;

    if (this.otherFilesPlusCompressedImageIcons.length === 0 && this.imageFiles.length === 0)
      this._uploadEmptyText(text);
    else if (this.otherFilesPlusCompressedImageIcons.length > 0 && this.imageFiles.length === 0)
      this._uploadFiles(text);
    else if (this.otherFilesPlusCompressedImageIcons.length > 0 && this.imageFiles.length > 0)
      this._uploadFilesWithCompressedImgs(text);
  }

  _uploadEmptyText(text: string): void {
    this.mainFeedService.postFeed(text).subscribe(data => {
      this.form.reset();
    });
  }

  _uploadFiles(text: string): void {
    this.uploadingFiles = true;
    const form = new FormData();
    this.otherFilesPlusCompressedImageIcons.forEach(file => form.append('files', file));
    this.mainFeedService.postFeedWithFiles(form, text).subscribe((event: any) => {
      this.uploading(event);
    }, (error: any) => this.toast.onError(error.error.message));
  }

  _uploadFilesWithCompressedImgs(text: string): void {
    this.uploadingFiles = true;
    const form = new FormData();
    this.otherFilesPlusCompressedImageIcons.forEach(file => form.append('files', file));
    this.imageFiles.forEach(file => form.append('images', file));
    this.mainFeedService.postWithFilesPlusCompressed(form, text).subscribe((event: any) => {
      this.uploading(event);
    }, (error: any) => this.toast.onError(error.error.message));
  }

  private uploading(event: any): void {
    if (event.type === HttpEventType.UploadProgress) {
      this.fileProgress = Math.round(100 * (event.loaded / event.total));
    }

    if (event.type === HttpEventType.Response) {
      this.form.reset();
      this.uploadingFiles = false;
      this.fileProgress = 0;
    };
  }

  isCompressing(): void {
    this.compressingFiles = this.imagesToCompress !== this.imagesCompressed;

    if (this.compressService) {
      this.viewRef.detectChanges();
    }
  }

  ngOnDestroy(): void {
    this.compressedImageIconSubscription.unsubscribe();
    this.compressedImageSubscription.unsubscribe();
    this.feedSocketSubscription.unsubscribe();
    this.intersectorSubscription.unsubscribe();
    this.deleteFeedSocketSubscription.unsubscribe();
  }
}
