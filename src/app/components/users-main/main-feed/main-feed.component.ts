import { Component, OnInit, ViewChild, OnDestroy, ElementRef, AfterViewInit, AfterViewChecked } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MainFeedService } from 'src/app/services/mainFeed.service';
import { CompressService } from 'src/app/services/compress.Service';
import { Subscription } from 'rxjs';
import { FeedModelDto } from 'src/app/model/feedModelDto';
import { SocketService } from 'src/app/services/socket.Service';
import { IntersectionObserverService } from 'src/app/services/intersectionObserver.service';
import { filter, switchMap } from 'rxjs/operators';
import { Chunk } from 'src/app/model/chunk';
import { ToastService } from 'src/app/utils/toast.service';

@Component({
  selector: 'app-main-feed',
  templateUrl: './main-feed.component.html',
  styleUrls: ['./main-feed.component.scss']
})
export class MainFeedComponent implements AfterViewInit, OnDestroy {
  @ViewChild('feed') form: NgForm;
  @ViewChild('filesInput') filesInput: ElementRef;
  @ViewChild('ob', { read: ElementRef }) ob: ElementRef;
  compressingFiles: boolean = false;
  filesSelected: FileList;
  imageFiles: File[] = [];
  otherFilesAndCompressedImages: File[] = [];
  compressingFileSubscription: Subscription;
  compressedImageSubscription: Subscription;
  feedData: FeedModelDto[] = [];
  feedSocketSubscription: Subscription;
  deleteFeedSocketSubscription: Subscription;
  intersectorSubscription: Subscription;
  limit = 5;
  offset = 0;
  isLoading = true;

  constructor(
    private mainFeedService: MainFeedService,
    private compressService: CompressService,
    private socketService: SocketService,
    private intersector: IntersectionObserverService,
    private toast: ToastService) { }


  ngAfterViewInit(): void {
    this.initializeMainFeed();
  }

  initializeMainFeed() {
    this.compressingFileSubscription = this.compressService.compressingFileSubject.subscribe((flag: boolean) => this.compressingFiles = flag);
    this.compressedImageSubscription = this.compressService.compressedImageSubject.subscribe((file: File) => this.otherFilesAndCompressedImages.push(file));
    this.subscribeIntersectorLoader();
    this.subscribeFeedSubject();
    this.subscribeDeleteFeedSubject();
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
    this.otherFilesAndCompressedImages = [];
    this.imageFiles = [];
    this.filesSelected = event.target.files;

    Array.from(this.filesSelected).forEach(file => {
      const fileType = file.type.split('/')[0];
      if (fileType === 'image') {
        this.compressService.compressImage(file, 250, 0.5);
        this.imageFiles.push(file);
      } else {
        this.otherFilesAndCompressedImages.push(file);
      }
    });
  }

  submit(): void {
    const text = this.form.value['nowy-wpis'];
    if (!text) return;

    if (this.otherFilesAndCompressedImages.length === 0 && this.imageFiles.length === 0)
      this._uploadEmptyText(text);
    else if (this.otherFilesAndCompressedImages.length > 0 && this.imageFiles.length === 0)
      this._uploadFiles(text);
    else if (this.otherFilesAndCompressedImages.length > 0 && this.imageFiles.length > 0)
      this._uploadFilesWithCompressedImgs(text);
  }

  _uploadEmptyText(text: string): void {
    this.mainFeedService.postFeed(text).subscribe(data => {
      this.form.reset();
    });
  }

  _uploadFiles(text: string): void {
    const form = new FormData();
    this.otherFilesAndCompressedImages.forEach(file => form.append('files', file));

    this.mainFeedService.postFeedWithFiles(form, text).subscribe(data => {
      this.form.reset();
      // this.filesInput.nativeElement.value = '';
    }, (error: any) => this.toast.onError(error.error.message));
  }

  _uploadFilesWithCompressedImgs(text: string): void {
    const form = new FormData();
    this.otherFilesAndCompressedImages.forEach(file => form.append('files', file));
    this.imageFiles.forEach(file => form.append('images', file));

    this.mainFeedService.postWithFilesPlusCompressed(form, text).subscribe(() => {
      this.form.reset();
      // this.filesInput.nativeElement.value = '';
    }, (error: any) => this.toast.onError(error.error.message));
  }

  ngOnDestroy(): void {
    this.compressedImageSubscription.unsubscribe();
    this.compressingFileSubscription.unsubscribe();
    this.feedSocketSubscription.unsubscribe();
    this.intersectorSubscription.unsubscribe();
  }
}
