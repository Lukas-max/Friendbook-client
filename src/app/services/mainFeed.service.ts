import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FeedModelDto } from '../model/feedModelDto';
import { Observable } from 'rxjs';
import { Chunk } from '../model/chunk';


@Injectable({
    providedIn: 'root'
})
export class MainFeedService {

    constructor(private http: HttpClient) { }


    getFeed(limit: string, offset: string): Observable<Chunk<FeedModelDto>> {
        return this.http.get<Chunk<FeedModelDto>>(`http://localhost:9010/api/feed`, { params: { limit: limit, offset: offset } });
    }

    postFeed(text: string): Observable<any> {
        return this.http.post(`http://localhost:9010/api/feed`, text);
    }

    postFeedWithFiles(form: FormData, text: string): Observable<number> {
        return this.http.post<number>(`http://localhost:9010/api/feed/addons`, form, { params: { text: text } });
    }

    postWithFilesPlusCompressed(form: FormData, text: string): Observable<number> {
        return this.http.post<number>(`http://localhost:9010/api/feed/addons-comp`, form, { params: { text: text } });
    }

    deleteFeed(feedId: number): Observable<any> {
        return this.http.delete(`http://localhost:9010/api/feed/` + feedId);
    }
}
