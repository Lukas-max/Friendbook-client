import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Chunk } from '../model/data/chunk';
import { FeedComment } from '../model/feed/feedComment';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class MainFeedCommentService {

    constructor(private http: HttpClient) { }


    getFeedComments(feedId: string, limit: string, offset: string): Observable<Chunk<FeedComment>> {
        return this.http.get<Chunk<FeedComment>>(`${environment.backendUrl}/api/feed-comment/` + feedId, { params: { limit: limit, offset: offset } });
    }

    postFeedComment(feedComment: FeedComment): Observable<any> {
        return this.http.post<any>(`${environment.backendUrl}/api/feed-comment/`, feedComment);
    }

    deleteFeedComments(commentId: number): Observable<any> {
        return this.http.delete<any>(`${environment.backendUrl}/api/feed-comment/` + commentId);
    }
}