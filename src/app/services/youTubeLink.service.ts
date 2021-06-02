import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class YouTubeLinkService {

    constructor() { }

    youTubeLinkSearch(links: string[], text: string, start: number): void {
        const length = text.length;
        const flag = text.includes('youtube.com/watch?v=', start);

        if (flag) {
            const index = text.indexOf('youtube.com/watch?v=', start);
            const cutStart = text.indexOf('=', index);
            const queryString = text.indexOf('&t=', index);
            const whitespace = text.indexOf(' ', index + 1);
            const cutEnd = this.youTubeLinkCutPlace(queryString, whitespace, length);
            const videoId = text.substring(cutStart + 1, cutEnd);

            links.push(videoId);
            this.youTubeLinkSearch(links, text, cutEnd);
        }
    }

    private youTubeLinkCutPlace(queryStringIndex: number, whitespaceIndex: number, length: number): number {
        if (queryStringIndex === -1 && whitespaceIndex === -1) return length;
        if (queryStringIndex === -1 && whitespaceIndex !== -1) return whitespaceIndex;
        if (queryStringIndex !== -1 && whitespaceIndex === -1) return queryStringIndex;

        return queryStringIndex < whitespaceIndex ? queryStringIndex : whitespaceIndex;
    }

    youTubeFrameSearch(links: string[], text: string, start: number): void {
        const length = text.length;
        const flag = text.includes('youtu.be/', start);

        if (flag) {
            const index = text.indexOf('youtu.be/', start);
            const cutStart = text.indexOf('/', index + 1);
            const whitespace = text.indexOf(' ', index + 1);
            const cutEnd = this.youTubeFrameCutPlace(whitespace, length);
            const videoId = text.substring(cutStart + 1, cutEnd);

            links.push(videoId);
            this.youTubeFrameSearch(links, text, cutEnd);
        }
    }

    private youTubeFrameCutPlace(whitespace: number, length: number): number {
        return whitespace === -1 ? length : whitespace;
    }

}