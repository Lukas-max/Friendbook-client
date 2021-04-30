import { Component, OnInit, Input } from '@angular/core';
import { FeedModelDto } from 'src/app/model/feedModelDto';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { MainFeedService } from 'src/app/services/mainFeed.service';
import { Router } from '@angular/router';
import { MainFeedCommentService } from 'src/app/services/mainFeedComment.service';
import { FeedComment } from 'src/app/model/feedComment';
import { Chunk } from 'src/app/model/chunk';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss']
})
export class FeedComponent implements OnInit {
  @Input() feed: FeedModelDto;
  comments: FeedComment[];
  userComment: string;
  userUUIDEncoded: string;
  showCommentButton = true;
  limit = 10;
  offset = 0;

  constructor(
    private authenticationService: AuthenticationService,
    private mainFeedService: MainFeedService,
    private router: Router,
    private commentService: MainFeedCommentService) { }

  ngOnInit(): void {
    this.userUUIDEncoded = btoa(this.feed.userUUID);
  }

  deleteFeed(): void {
    if (confirm('Chcesz usunąć ten post?'))
      this.mainFeedService.deleteFeed(this.feed.feedId).subscribe(() => {
        this.router.navigate(['/user', 'starter', 'dummy'], { skipLocationChange: true })
          .then(() => this.router.navigate(['/user', 'starter', 'main-feed']));
      });
  }

  isTheSameUser(): boolean {
    return this.authenticationService.isTheSameId(this.feed.userUUID);
  }

  loadComments() {
    this.commentService.getFeedComments(this.feed.feedId.toString(), this.limit.toString(), this.offset.toString())
      .subscribe((comments: Chunk<FeedComment>) => {
        console.log(comments);
      })
  }

  postComment() { }

}
