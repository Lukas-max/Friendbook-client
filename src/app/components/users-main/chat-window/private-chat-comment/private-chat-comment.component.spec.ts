import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivateChatCommentComponent } from './private-chat-comment.component';

describe('PrivateChatCommentComponent', () => {
  let component: PrivateChatCommentComponent;
  let fixture: ComponentFixture<PrivateChatCommentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrivateChatCommentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivateChatCommentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
