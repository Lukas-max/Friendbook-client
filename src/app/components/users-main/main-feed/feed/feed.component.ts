import { Component, OnInit, Input } from '@angular/core';
import { FeedModelDto } from 'src/app/model/feedModelDto';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { MainFeedService } from 'src/app/services/mainFeed.service';
import { Router } from '@angular/router';
import { ToastService } from 'src/app/utils/toast.service';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss']
})
export class FeedComponent implements OnInit {
  @Input() feed: FeedModelDto;
  userComment: string;
  userUUIDEncoded: string;


  constructor(
    private authenticationService: AuthenticationService,
    private mainFeedService: MainFeedService,
    private router: Router,
    private toast: ToastService) { }

  ngOnInit(): void {
    this.userUUIDEncoded = btoa(this.feed.userUUID);
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

}
