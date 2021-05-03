import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Chunk } from '../model/chunk';
import { FeedComment } from '../model/feedComment';

@Injectable({
    providedIn: 'root'
})
export class MainFeedCommentService {

    constructor(private http: HttpClient) { }


    getFeedComments(feedId: string, limit: string, offset: string): Observable<Chunk<FeedComment>> {
        return this.http.get<Chunk<FeedComment>>(`http://localhost:9010/api/feed-comment/` + feedId, { params: { limit: limit, offset: offset } });
    }

    postFeedComment(feedComment: FeedComment): Observable<any> {
        return this.http.post<any>(`http://localhost:9010/api/feed-comment/`, feedComment);
    }

    deleteFeedComments(commentId: number): Observable<any> {
        return this.http.delete<any>(`http://localhost:9010/api/feed-comment/` + commentId);
    }
}