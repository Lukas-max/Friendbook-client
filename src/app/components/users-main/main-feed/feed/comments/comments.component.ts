import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { FeedModelDto } from 'src/app/model/feedModelDto';
import { FeedComment } from 'src/app/model/feedComment';
import { MainFeedCommentService } from 'src/app/services/mainFeedComment.service';
import { Chunk } from 'src/app/model/chunk';
import { IntersectionObserverService } from 'src/app/services/intersectionObserver.service';
import { filter, switchMap } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { NgForm } from '@angular/forms';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { SocketService } from 'src/app/services/socket.Service';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class CommentsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('observerLoader', { read: ElementRef }) observerLoader: ElementRef;
  @Input() feed: FeedModelDto;
  subscriber: Subscription;
  commentSubjectSubscription: Subscription;
  userUUID: string;
  username: string;
  commentsArray: FeedComment[] = [];
  commentsLoaded = false;
  allCommentsLoaded = false;
  commentsAtStartup = '5';
  limit = 10;
  offset = 0;

  constructor(
    private commentService: MainFeedCommentService,
    private intersector: IntersectionObserverService,
    private authenticationService: AuthenticationService,
    private socketService: SocketService) { }

  ngOnInit(): void {
    this.initializeUser();
    this.initializeCommentSubscription();
  }

  /**
   *  Gets the user UUID number and username from session storage to the component variable environment. 
   *  If there is no user authenticated, performs full user logout and throws an Error.
   */
  initializeUser(): void {
    this.userUUID = this.authenticationService.getLoggedUserId();
    this.username = this.authenticationService.getUsername();
    if (!this.userUUID || !this.username) {
      this.authenticationService.logout();
      throw new Error('Brak poprawnego uwierzytelnienia. Wylogowano.');
    }
  }

  /**
   * Subscribes to stomp comment channel. If a new comment is added from the user it checks if the added comment belongs to this feed 
   * by checking the feedId. If yes, the comment is pushed to the commentsArray. Then offset number is updated to new comment length.
   * Thats why when a user posts a comment he and other users will have the comment bar updated without reloading the component.
   */
  initializeCommentSubscription(): void {
    this.commentSubjectSubscription = this.socketService.commentFeedSubject.subscribe((comment: FeedComment) => {
      if (comment.feedId === this.feed.feedId) {
        this.commentsArray.push(comment);
      }
      this.offset = this.commentsArray.length;
    });
  }

  /**
   * Subscribes to created IntersectionObserver. If our view intersect with the HTMLElement we perform first comment download from the server. 
   * If the number of comments is less then the set variable commentsAtStartup, that mean we downloaded all the comments from the database and there is nothing more.
   * So we set variable allCommentsLoaded to true, so the download comment bar will not appear. Then we add the comments to the array, set the new value for the offset
   * and set commentsLoaded to true so we can display button to load rest of the comments if the first where loaded, and still there are more comments on the server.
   * Lastly we usubscribe from the IntersectorObserver so it wont fetch more comments when user scrolls the page, it will happen only by the download comment button.
   */
  ngAfterViewInit(): void {
    this.subscriber = this.intersector.createAndObserve(this.observerLoader).pipe(
      filter((isIntersecting: boolean) => isIntersecting),
      switchMap(() => this.commentService.getFeedComments(this.feed.feedId.toString(), this.commentsAtStartup, this.offset.toString()))
    ).subscribe((comments: Chunk<FeedComment>) => {
      if (comments.content.length < +this.commentsAtStartup) {
        this.allCommentsLoaded = true;
      }

      comments.content.forEach((comment: FeedComment) => this.commentsArray.unshift(comment));
      this.offset = this.commentsArray.length;
      this.commentsLoaded = true;
      this.subscriber.unsubscribe();
    });
  }

  /**
   * If the allCommentsLoaded is false and commentsLoaded is true (that is first set of comments) then we display a button that invokes this method.
   * By this button we load the rest of the comments to the commentsArray, if there are no comments to laod we set the allCommentsLoaded to true. Besides that
   * we set a new offset after each load.
   */
  loadComments(): void {
    this.commentService.getFeedComments(this.feed.feedId.toString(), this.limit.toString(), this.offset.toString())
      .subscribe((comments: Chunk<FeedComment>) => {
        if (comments.content.length === 0 || comments.content.length < this.limit) {
          this.allCommentsLoaded = true;
        }

        comments.content.forEach((comment: FeedComment) => this.commentsArray.unshift(comment));
        this.offset = this.commentsArray.length;
      })
  }

  /**
   * 
   * Here we post a FeedComment by the logged user then reset the input messaage form.
   */
  postComment(commentForm: NgForm): void {
    const comment = commentForm.value.comment;
    if (!comment || comment.length === 0) return;

    const feedComment: FeedComment = {
      feedId: this.feed.feedId,
      username: this.username,
      userUUID: this.userUUID,
      content: comment,
      timestamp: new Date().getTime()
    };
    commentForm.reset();

    this.commentService.postFeedComment(feedComment).subscribe(() => {
      //
    }, (err: any) => console.error(err));
  }

  /**
   * 
   * @param index is the index of the comment passed from the commentsArray.
   * This method deletes the comment by it's unique comment id number. We ask the user if hew wants to delete the comment. if so we delete the comment.
   * Then we dont update the bar by stomp. We only splice the comment from the user array. The comments will be uptaded on component reload.
   */
  deleteComment(index: number) {
    if (confirm('Czy na pewnoc chcesz usunąć komentarz: ' + this.commentsArray[index].content)) {
      const comment: FeedComment = this.commentsArray[index];
      this.commentService.deleteFeedComments(comment.id).subscribe(() => {
        const idx = this.commentsArray.findIndex((cmnt: FeedComment) => cmnt.id === comment.id);
        this.commentsArray.splice(idx, 1);
      }, (err: any) => console.error(err));
    }
  }

  /**
   * We unscubsribe from:
   * - the stomp subscription fetching new posted comments from users.
   */
  ngOnDestroy(): void {
    this.commentSubjectSubscription.unsubscribe();
  }
}
