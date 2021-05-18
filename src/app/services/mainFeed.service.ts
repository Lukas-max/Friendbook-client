import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpRequest, HttpEvent } from '@angular/common/http';
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

    postFeedWithFiles(form: FormData, text: string): Observable<HttpEvent<any>> {
        const param = new HttpParams().append('text', text);
        const request = new HttpRequest('POST', `http://localhost:9010/api/feed/addons`, form, {
            reportProgress: true,
            responseType: 'json',
            params: param
        });

        return this.http.request(request);
    }

    postWithFilesPlusCompressed(form: FormData, text: string): Observable<HttpEvent<any>> {
        const param = new HttpParams().append('text', text);
        const request = new HttpRequest(`POST`, `http://localhost:9010/api/feed/addons-comp`, form, {
            reportProgress: true,
            responseType: 'json',
            params: param
        })

        return this.http.request(request);
    }

    deleteFeed(feedId: number): Observable<any> {
        return this.http.delete(`http://localhost:9010/api/feed/` + feedId);
    }
}
