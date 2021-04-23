import { Component, OnInit, ViewChild, OnDestroy, ElementRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MainFeedService } from 'src/app/services/mainFeed.service';
import { CompressService } from 'src/app/services/compress.Service';
import { Subscription } from 'rxjs';
import { FeedModelDto } from 'src/app/model/feedModelDto';

@Component({
  selector: 'app-main-feed',
  templateUrl: './main-feed.component.html',
  styleUrls: ['./main-feed.component.scss']
})
export class MainFeedComponent implements OnInit, OnDestroy {
  @ViewChild('feed') form: NgForm;
  @ViewChild('filesInput') filesInput: ElementRef;
  compressingFiles: boolean = false;
  filesSelected: FileList;
  imageFiles: File[] = [];
  otherFilesAndCompressedImages: File[] = [];
  compressingFileSubscription: Subscription;
  compressedImageSubscription: Subscription;
  feedData: FeedModelDto[];

  constructor(private mainFeedService: MainFeedService, private compressService: CompressService) { }

  ngOnInit(): void {
    this.compressingFileSubscription = this.compressService.compressingFileSubject.subscribe((flag: boolean) => this.compressingFiles = flag);
    this.compressedImageSubscription = this.compressService.compressedImageSubject.subscribe((file: File) => this.otherFilesAndCompressedImages.push(file));
    this.mainFeedService.getFeed().subscribe((feed: FeedModelDto[]) => {
      this.feedData = feed;
    });
  }

  getFeed(): void {
    this.mainFeedService.getFeed().subscribe((feed: FeedModelDto[]) => {
      this.feedData = feed;
    });
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
    }, (err: any) => console.error(err));
  }

  _uploadFilesWithCompressedImgs(text: string): void {
    const form = new FormData();
    this.otherFilesAndCompressedImages.forEach(file => form.append('files', file));
    this.imageFiles.forEach(file => form.append('images', file));

    this.mainFeedService.postWithFilesPlusCompressed(form, text).subscribe(() => {
      this.form.reset();
      // this.filesInput.nativeElement.value = '';
    }, (err: any) => console.error(err));
  }

  ngOnDestroy(): void {
    this.compressedImageSubscription.unsubscribe();
    this.compressingFileSubscription.unsubscribe();
  }
}
