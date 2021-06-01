import { Component, OnInit, Input, AfterViewInit, AfterViewChecked } from '@angular/core';
import { FeedModelDto } from 'src/app/model/feed/feedModelDto';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { MainFeedService } from 'src/app/services/mainFeed.service';
import { Router } from '@angular/router';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss']
})
export class FeedComponent implements OnInit {
  @Input() feed: FeedModelDto;
  userComment: string;
  userUUIDEncoded: string;
  ytLinks: string[] = [];


  constructor(
    private authenticationService: AuthenticationService,
    private mainFeedService: MainFeedService,
    private router: Router,
    private toast: ToastService) { }

  ngOnInit(): void {
    this.userUUIDEncoded = btoa(this.feed.userUUID);
    this.youTubeLinkSearch(0);
    this.youTubeFrameSearch(0);
  }

  deleteFeed(): void {
    if (confirm('Chcesz usunąć ten post?'))
      this.mainFeedService.deleteFeed(this.feed.feedId).subscribe(() => {
        this.router.navigate(['/user', 'starter', 'dummy'], { skipLocationChange: true })
          .then(() => this.router.navigate(['/user', 'starter', 'main-feed']));
      }, (error) => this.toast.onError(error.error.message));
  }

  isTheSameUser(): boolean {
    return this.authenticationService.isTheSameId(this.feed.userUUID);
  }

  youTubeLinkSearch(start: number): void {
    const length = this.feed.text.length;
    const flag = this.feed.text.includes('youtube.com/watch?v=', start);

    if (flag) {
      const index = this.feed.text.indexOf('youtube.com/watch?v=', start);
      const cutStart = this.feed.text.indexOf('=', index);
      const queryString = this.feed.text.indexOf('&t=', index);
      const whitespace = this.feed.text.indexOf(' ', index + 1);
      const cutEnd = this.youTubeLinkCutPlace(queryString, whitespace, length);
      const videoId = this.feed.text.substring(cutStart + 1, cutEnd);

      this.ytLinks.push(videoId);
      this.youTubeLinkSearch(cutEnd);
    }
  }

  private youTubeLinkCutPlace(queryStringIndex: number, whitespaceIndex: number, length: number): number {
    if (queryStringIndex === -1 && whitespaceIndex === -1) return length;
    if (queryStringIndex === -1 && whitespaceIndex !== -1) return whitespaceIndex;
    if (queryStringIndex !== -1 && whitespaceIndex === -1) return queryStringIndex;

    return queryStringIndex < whitespaceIndex ? queryStringIndex : whitespaceIndex;
  }

  youTubeFrameSearch(start: number): void {
    const length = this.feed.text.length;
    const flag = this.feed.text.includes('youtu.be/', start);

    if (flag) {
      const index = this.feed.text.indexOf('youtu.be/', start);
      const cutStart = this.feed.text.indexOf('/', index + 1);
      const whitespace = this.feed.text.indexOf(' ', index + 1);
      const cutEnd = this.youTubeFrameCutPlace(whitespace, length);
      const videoId = this.feed.text.substring(cutStart + 1, cutEnd);

      this.ytLinks.push(videoId);
      this.youTubeFrameSearch(cutEnd);
    }
  }

  private youTubeFrameCutPlace(whitespace: number, length: number): number {
    return whitespace === -1 ? length : whitespace;
  }

}
