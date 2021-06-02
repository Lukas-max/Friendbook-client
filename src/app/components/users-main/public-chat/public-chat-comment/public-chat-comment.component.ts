import { Component, OnInit, Input } from '@angular/core';
import { YouTubeLinkService } from 'src/app/services/youTubeLink.service';

@Component({
  selector: 'app-public-chat-comment',
  templateUrl: './public-chat-comment.component.html',
  styleUrls: ['./public-chat-comment.component.scss']
})
export class PublicChatCommentComponent implements OnInit {
  @Input() content: string;
  ytLinks: string[] = [];

  constructor(private ytLinkService: YouTubeLinkService) { }

  ngOnInit(): void {
    this.ytLinkService.youTubeLinkSearch(this.ytLinks, this.content, 0);
    this.ytLinkService.youTubeFrameSearch(this.ytLinks, this.content, 0);
  }

}
