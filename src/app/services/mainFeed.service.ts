import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Injectable({
    providedIn: 'root'
})
export class MainFeedService {

    constructor(private http: HttpClient) { }


    postFeed(text: string) {
        return this.http.post(`http://localhost:9010/api/feed`, text);
    }

    postFeedWithFiles(form: FormData, text: string) {
        return this.http.post(`http://localhost:9010/api/feed/addons`, form, { params: { text: text } });
    }

    postWithFilesPlusCompressed(form: FormData, text: string) {
        return this.http.post(`http://localhost:9010/api/feed/addons-comp`, form, { params: { text: text } });
    }
}
