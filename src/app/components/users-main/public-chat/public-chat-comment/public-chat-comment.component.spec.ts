import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicChatCommentComponent } from './public-chat-comment.component';

describe('PublicChatCommentComponent', () => {
  let component: PublicChatCommentComponent;
  let fixture: ComponentFixture<PublicChatCommentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PublicChatCommentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicChatCommentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
