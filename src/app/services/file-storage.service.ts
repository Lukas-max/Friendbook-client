import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FileDataDto } from '../model/fileDataDto';

@Injectable({
    providedIn: 'root',
})
export class FileStorageService {

    constructor(private http: HttpClient) { }

    getFolders(uuid?: string): Observable<string[]> {
        if (uuid)
            return this.http.get<string[]>(`http://localhost:9010/api/storage`, { params: { 'userUUID': uuid } });
        else
            return this.http.get<string[]>(`http://localhost:9010/api/storage`);
    }

    getFileData(uuid: string, folder: string): Observable<FileDataDto[]> {
        return this.http.get<FileDataDto[]>(`http://localhost:9010/api/storage/files`, { params: { 'userUUID': uuid, 'directory': folder } });
    }

    downloadFile(uuid: string, folder: string, fileName: string) {
        return this.http.get(`http://localhost:9010/api/storage/${uuid}/${folder}/${fileName}`);
    }

    uploadFile(form: FormData, folder: string) {
        const param = new HttpParams().append('directory', folder);
        const request = new HttpRequest('POST', `http://localhost:9010/api/storage`, form, {
            reportProgress: true,
            responseType: 'json',
            params: param
        });

        return this.http.request(request);
    }
}