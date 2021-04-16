import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpParams, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FileDataDto } from '../model/fileDataDto';

@Injectable({
    providedIn: 'root',
})
export class FileStorageService {

    constructor(private http: HttpClient) { }

    getFolders(uuid: string): Observable<string[]> {
        return this.http.get<string[]>(`http://localhost:9010/api/storage`, { params: { 'userUUID': uuid } });
    }

    getFileData(uuid: string, folder: string): Observable<FileDataDto[]> {
        return this.http.get<FileDataDto[]>(`http://localhost:9010/api/storage/files`, { params: { 'userUUID': uuid, 'directory': folder } });
    }

    uploadFile(form: FormData, folder: string): Observable<HttpEvent<any>> {
        const param = new HttpParams().append('directory', folder);
        const request = new HttpRequest('POST', `http://localhost:9010/api/storage`, form, {
            reportProgress: true,
            responseType: 'json',
            params: param
        });

        return this.http.request(request);
    }

    uploadImage(form: FormData, folder: string): Observable<HttpEvent<any>> {
        const param = new HttpParams().append('directory', folder);
        const request = new HttpRequest('POST', `http://localhost:9010/api/storage/images`, form, {
            reportProgress: true,
            responseType: 'json',
            params: param
        });

        return this.http.request(request);
    }

    createFolder(directory: string): Observable<any> {
        return this.http.post<any>(`http://localhost:9010/api/storage/directory`, directory);
    }

    deleteFolder(directory: string): Observable<boolean> {
        return this.http.delete<boolean>(`http://localhost:9010/api/storage/${directory}`);
    }

    deleteFile(directory: string, fileName: string): Observable<any> {
        return this.http.delete(`http://localhost:9010/api/storage/${directory}/${fileName}`);
    }
} 