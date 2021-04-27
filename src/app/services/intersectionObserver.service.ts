import { ElementRef, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { mergeMap, map, distinctUntilChanged, filter } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class IntersectionObserverService {
    _observer: IntersectionObserver | undefined;

    constructor() { }

    // createAndObserve(element: ElementRef) {
    //     const options = {
    //         root: null,
    //         threshold: 0
    //     };

    //     this._observer = new IntersectionObserver((entries, _) => {
    //         entries.forEach((entry: IntersectionObserverEntry) => {
    //             if (entry.isIntersecting)
    //                 console.log('tak');
    //         });
    //     }, options);

    //     this._observer.observe(element.nativeElement);
    // }

    doObserve(element: ElementRef): Observable<boolean> {
        return new Observable(observer => {
            const intersector = new IntersectionObserver((entries) => {
                observer.next(entries);
            });

            intersector.observe(element.nativeElement);
            return () => { intersector.disconnect(); }
        })
            .pipe(
                mergeMap((entries: IntersectionObserverEntry[]) => entries),
                map(entry => entry.isIntersecting),
                filter((intersect: boolean) => intersect)
            );
    }

    createAndObserve(element: ElementRef): Observable<boolean> {
        return new Observable(observer => {
            const intersectionObserver = new IntersectionObserver(entries => {
                observer.next(entries);
            });

            intersectionObserver.observe(element.nativeElement);
            return () => { intersectionObserver.disconnect(); };
        }).pipe(
            mergeMap((entries: IntersectionObserverEntry[]) => entries),
            map(entry => entry.isIntersecting),
            distinctUntilChanged()
        );
    }
}