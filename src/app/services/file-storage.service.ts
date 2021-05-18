import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpParams, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FileDataDto } from '../model/fileDataDto';
import { Chunk } from '../model/chunk';
import { BytePackage } from '../model/bytePackage';

@Injectable({
    providedIn: 'root',
})
export class FileStorageService {

    constructor(private http: HttpClient) { }

    getFolders(uuid: string): Observable<string[]> {
        return this.http.get<string[]>(`http://localhost:9010/api/storage`, { params: { 'userUUID': uuid } });
    }

    getFileData(uuid: string, folder: string, limit: string, offset: string): Observable<Chunk<FileDataDto>> {
        return this.http.get<Chunk<FileDataDto>>(`http://localhost:9010/api/storage/files`,
            { params: { 'userUUID': uuid, 'directory': folder, 'limit': limit, 'offset': offset } });
    }

    getProfilePhotoHighQuality(uuid: string): Observable<BytePackage> {
        return this.http.get<BytePackage>(`http://localhost:9010/api/storage/profile/high-quality/${uuid}`);
    }

    getProfilePhotoLowQuality(uuid: string): Observable<BytePackage> {
        return this.http.get<BytePackage>(`http://localhost:9010/api/storage/profile/low-quality/${uuid}`);
    }

    uploadFile(form: FormData, folder: string, images: boolean): Observable<HttpEvent<any>> {
        const param = new HttpParams().append('directory', folder);
        const url = images ? `http://localhost:9010/api/storage/images` : `http://localhost:9010/api/storage`;
        const request = new HttpRequest('POST', url, form, {
            reportProgress: true,
            responseType: 'json',
            params: param
        });

        return this.http.request(request);
    }

    uplodProfilePhoto(form: FormData): Observable<any> {
        return this.http.post(`http://localhost:9010/api/storage/profile`, form);
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

    deleteProfilePhoto(): Observable<any> {
        return this.http.delete(`http://localhost:9010/api/storage/profile`);
    }
} 