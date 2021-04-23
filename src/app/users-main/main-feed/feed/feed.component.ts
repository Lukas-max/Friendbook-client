import { Component, OnInit, Input } from '@angular/core';
import { FeedModelDto } from 'src/app/model/feedModelDto';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss']
})
export class FeedComponent implements OnInit {
  @Input() feed: FeedModelDto;

  constructor() { }

  ngOnInit(): void {
  }

}
