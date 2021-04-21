import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CompressService {
    compressingFileSubject: Subject<boolean> = new Subject<boolean>();
    compressedImageSubject: Subject<File> = new Subject<File>();


    _compressImage(file: File, width: number, quality: number): void {
        this.compressingFileSubject.next(true);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event: any) => {
            const img = new Image();
            img.src = event.target.result;

            img.onload = (event: any) => {
                const canvas = this._defineCanvas(event, width);
                this._createBlob(canvas, event, file, quality);
                this.compressingFileSubject.next(false);
            };
        };
    }

    _defineCanvas(event: any, width: number): HTMLCanvasElement {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = width;
        const scale = MAX_WIDTH / event.target.width;
        canvas.width = MAX_WIDTH;
        canvas.height = event.target.height * scale;
        return canvas;
    }

    _createBlob(canvas: HTMLCanvasElement, event: any, file: File, quality: number): void {
        const ctx = <CanvasRenderingContext2D>canvas.getContext('2d');
        ctx.drawImage(event.target, 0, 0, canvas.width, canvas.height);
        ctx.canvas.toBlob((blob: Blob) => {
            const newFile: File = new File([blob], file.name, { lastModified: new Date().getTime(), type: blob.type });
            this.compressedImageSubject.next(newFile);
        }, 'image/jpeg', quality);
    }

    _renameFileExtension(name: string): string {
        const fileSplit = name.split('.');
        const length = fileSplit.length;
        fileSplit[length - 1] = 'jpeg';
        return fileSplit.join('.');
    }
}