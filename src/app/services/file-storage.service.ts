import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class FileStorageService {

    constructor(private http: HttpClient) { }

    getFolders(uuid?: string): Observable<string[]> {
        return this.http.get<string[]>(`http://localhost:9010/api/storage`);
    }
}