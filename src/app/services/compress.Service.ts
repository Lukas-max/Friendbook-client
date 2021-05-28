import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { CompressType } from '../model/files/compressType';

@Injectable({
    providedIn: 'root'
})
export class CompressService {
    compressingFileSubject: Subject<boolean> = new Subject<boolean>();
    compressedImageIconSubject: Subject<File> = new Subject<File>();
    compressedImageSubject: Subject<File> = new Subject<File>();

    compressImage(file: File, width: number, quality: number, type: CompressType): void {
        this.compressingFileSubject.next(true);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event: any) => {
            const img = new Image();
            img.src = event.target.result;

            img.onload = (event: any) => {
                if (type === CompressType.IMAGE_ICON) {
                    const canvas = this._defineCanvas(event, width);
                    this._createBlob(canvas, event, file, quality, CompressType.IMAGE_ICON);
                }

                if (type === CompressType.IMAGE) {
                    const canvas = this._defineCanvasNoSizeRefactor(event);
                    this._createBlob(canvas, event, file, quality, CompressType.IMAGE);
                }
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

    _defineCanvasNoSizeRefactor(event: any): HTMLCanvasElement {
        const canvas = document.createElement('canvas');
        canvas.width = event.target.width;
        canvas.height = event.target.height;
        return canvas;
    }

    _createBlob(canvas: HTMLCanvasElement, event: any, file: File, quality: number, type: CompressType): void {
        const ctx = <CanvasRenderingContext2D>canvas.getContext('2d');
        ctx.drawImage(event.target, 0, 0, canvas.width, canvas.height);
        ctx.canvas.toBlob((blob: Blob) => {
            const newFile: File = new File([blob], file.name, { lastModified: new Date().getTime(), type: blob.type });
            type === CompressType.IMAGE_ICON ? this.compressedImageIconSubject.next(newFile) : this.compressedImageSubject.next(newFile);
        }, 'image/jpeg', quality);
    }

    _renameFileExtension(name: string): string {
        const fileSplit = name.split('.');
        const length = fileSplit.length;
        fileSplit[length - 1] = 'jpeg';
        return fileSplit.join('.');
    }
}