import { Component, OnInit, Input } from '@angular/core';
import { YouTubeLinkService } from 'src/app/services/youTubeLink.service';

@Component({
  selector: 'app-private-chat-comment',
  templateUrl: './private-chat-comment.component.html',
  styleUrls: ['./private-chat-comment.component.scss']
})
export class PrivateChatCommentComponent implements OnInit {
  @Input() content: string;
  ytLinks: string[] = [];

  constructor(private ytLinkService: YouTubeLinkService) { }

  ngOnInit(): void {
    this.ytLinkService.youTubeLinkSearch(this.ytLinks, this.content, 0);
    this.ytLinkService.youTubeFrameSearch(this.ytLinks, this.content, 0);
  }

}
