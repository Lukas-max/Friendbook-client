import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MainFeedService } from 'src/app/services/mainFeed.service';
import { CompressService } from 'src/app/services/compress.Service';

@Component({
  selector: 'app-main-feed',
  templateUrl: './main-feed.component.html',
  styleUrls: ['./main-feed.component.scss']
})
export class MainFeedComponent implements OnInit {
  @ViewChild('feed') feed: NgForm;

  constructor(private mainFeedService: MainFeedService, private compressService: CompressService) { }

  ngOnInit(): void {
  }

  submit() {
    const text = this.feed.value['nowy-wpis'];
    this.mainFeedService.postFeed(text).subscribe(data => {
      this.feed.reset();
    });
  }

}
